
/*
 * handle main pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.bootstrap = function(req, res, next){
    if ('damusiq.com' !== req.headers.host && 'production' === process.env.ENV) {
        res.redirect(301, 'http://damusiq.com'); // prevent boilarplate sites
    }
    // parse domain / subdomain and perform 301 redirections, or get language
    res.lang = req.lang = 'en' || 'en';
    res.locals.lang = req.lang;
    res.locals.title_prepend = 'Damusiq';
    res.locals.title = '';
    res.locals.keywords = [];
    res.locals.og_title = 'Damusiq: Musiq library for enthusiasts!';
    res.locals.og_image = 'http://damusiq.com/images/og-image.png';
    res.locals.og_url = 'http://damusiq.com' + req.path;
    res.locals.og_description = 'Explore, Find, Listen and Share academic Music and Download scores for free!';

    var url = require('url'),
        url_parts = url.parse(req.url, true);
        q = url_parts.pathname.replace(/(\/|\.html|-)/g, ' ').trim();

    res.locals.q = q;
    next();
};

exports.homepage = function(req, res){
    var popularComposersPromise = new mongoose.Promise();

    mongoose.model('Composer').aggregate([
            { $unwind : '$opuses' },
            { $group : { _id: '$_id', count: { $sum: 1 }, fullname: { $first: '$fullname' }, uri: { $first: '$uri'}  } },
            { $sort : { count: -1 } },
            { $limit : 15 }
        ], function (err, composers) {
            popularComposersPromise.resolve(null, composers);
        });

    mongoose.Promise
        .when(
            mongoose.model('ComposerCategory')
                .find({ lang: req.lang, count: { '$gt': 10 } }, 'uri name count')
                .sort({ count: -1 })
                .limit(15)
                .exec()
            ,
            popularComposersPromise
        )
        .addBack(function (err, popularCategories, popularComposers) {
            res.render('main-homepage.html', {
                popular_categories: popularCategories,
                popular_composers: popularComposers,
                title: 'Music library for enthusiasts!',
                extra_copyright: '<a href="http://www.flickr.com/photos/frederikmagle/6880670228" rel="author" target="_blank">Photography</a> by Magle.dk under the <a href="http://creativecommons.org/licenses/by/2.0/" target="_blank">CC license</a>.'
            });
        });
};

exports.search = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        q = (url_parts.query.q||'').sanitize();

    var composersPromise = new mongoose.Promise(),
        categoriesPromise = new mongoose.Promise();

        mongoose.model('Composer')
            .textSearch(q, {
                project: 'uri fullname',
                filter: { },
                limit: 20,
                language: 'english',
                lean: false
            }, function (err, search) {
                composersPromise.resolve(null, search||{});
            });

        mongoose.model('ComposerCategory')
            .textSearch(q, {
                project: 'uri name count',
                filter: { lang: res.lang },
                limit: 20,
                language: 'english',
                lean: false
            }, function (err, search) {
                categoriesPromise.resolve(null, search||{});
            });

    mongoose.Promise
        .when(composersPromise, categoriesPromise)
        .addBack(function (err, composerSearch, categorySearch) {

            var composerResults = (composerSearch.results||[]).map(function (result) {
                var composer = result.obj;
                return {
                    type: 'composer',
                    id: composer.get('_id').toString(),
                    name: composer.get('fullname'),
                    url: global.helpers.url({ composerUri: composer.get('uri') })
                };
            });

            var categoryResults = (categorySearch.results||[]).map(function (result) {
                var category = result.obj;
                return {
                    type: 'composer-category',
                    id: category.get('_id').toString(),
                    name: category.get('name'),
                    url: global.helpers.url({ categoryUri: category.get('uri') }),
                    count: category.get('count')
                };
            });

            var results = categoryResults.concat(composerResults);

            if (1 === results.length) {
                res.redirect(301, results[0].url);
            }
            res.render('main-search.html', {
                results: results,
                title: 'Search results for ' + q,
                q: q
            });
        });
};

exports.advancedSearch = function (req, res) {
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore'),
        p = 1*(url_parts.query.p||'1'),
        ipp = 20,
        arg_search_for = (url_parts.query.search_for||'').sanitize(),
        arg_composer_name = (url_parts.query.composer_name||'').sanitize(),
        arg_opus_identifier = (url_parts.query.opus_identifier||'').sanitize(),
        arg_score_title = (url_parts.query.score_title||'').sanitize(),
        arg_periods = url_parts.query['period[]']||'',
        arg_instruments = url_parts.query['instrument[]']||'';

    arg_periods = arg_periods ? ('string' === typeof arg_periods ? [arg_periods] : arg_periods) : [];
    arg_instruments = arg_instruments ? ('string' === typeof arg_instruments ? [arg_instruments] : arg_instruments) : [];

    var resultsPromise = new mongoose.Promise();

    var periodsPromise = mongoose.model('Period')
            .find({ uri: { $in: arg_periods } }, 'uri name')
            .sort({ order_index: 1 })
            .limit(100)
            .exec();

    var allPeriodsPromise = mongoose.model('Period')
            .find({}, 'uri name')
            .sort({ order_index: 1 })
            .limit(100)
            .exec();

    var allInstrumentsPromise = mongoose.model('Instrument')
            .find({ }, 'uri name')
            .sort({ name: 1 })
            .limit(100)
            .exec();

    mongoose.Promise
        .when(periodsPromise)
        .addBack(function (err, periods) {
            var periodById = {};
            periods.forEach(function (p) { periodById[p._id] = p; });

            if ('composer' === arg_search_for) {
                mongoose.model('Composer').find({
                                fullname: new RegExp('(' + arg_composer_name.split(' ').join('|') + ').*', 'i'),
                                periods: periods ? { $in: _(periods).pluck('_id') } : { $ne: null }
                            }, 
                            'fullname uri periods'
                        )
                        .populate('periods')
                        .skip((p-1)*ipp)
                        .limit(ipp)
                        .exec(function (err, composers) {
                            var results = [];
                            _(composers).each(function (composer) {
                                results.push({
                                    composer: composer,
                                    periods: composer.get('periods')
                                });
                            });
                            resultsPromise.resolve(null, results);
                        });
            } else if ('score' === arg_search_for) {
                var composersPromise = new mongoose.Promise();
                if (arg_composer_name) { // skipping: || periods
                    composersPromise = mongoose.model('Composer')
                        .find({
                                fullname: new RegExp('(' + arg_composer_name.split(' ').join('|') + ').*', 'i'),
                                periods: periods ? { $in: _(periods).pluck('_id') } : { $ne: null }
                            },
                            'fullname uri periods'
                        )
                        .limit(100)
                        .exec();
                } else {
                    composersPromise.resolve(null, null);
                }

                var opusesPromise = new mongoose.Promise();
                if (arg_opus_identifier) {
                    opusesPromise = mongoose.model('Opus')
                        .find({
                                identifier: new RegExp('(' + arg_opus_identifier.split(' ').join('|') + ').*', 'i'),
                            },
                            ''
                        )
                        .limit(100)
                        .exec();
                } else {
                    opusesPromise.resolve(null, null);
                }

                var instrumentsPromise = new mongoose.Promise();
                if (arg_instruments) {
                    instrumentsPromise = mongoose.model('Instrument')
                        .find({ uri: { $in: arg_instruments } }, 'uri name')
                        .sort({ name: 1 })
                        .limit(100)
                        .exec();
                } else {
                    instrumentsPromise.resolve(null, null);
                }

                mongoose.Promise
                    .when(composersPromise, opusesPromise, instrumentsPromise)
                    .addBack(function (err, composers, opuses, instruments) {
                        mongoose.model('Score')
                                .find({
                                    name: new RegExp('(' + arg_score_title.split(' ').join('|') + ').*', 'i'),
                                    composer: composers ? { $in: _(composers).pluck('_id') } : { $ne: null },
                                    opus: opuses ? { $in: _(opuses).pluck('_id') } : { $ne: null },
                                    instruments: instruments ? { $in: _(instruments).pluck('_id') } : { $ne: null },
                                    format: 'pdf' // TODO enable other formats
                                })
                                .sort({ identifier: 1, name: 1 })
                                .skip((p-1)*ipp)
                                .limit(ipp)
                                .populate('instruments', 'uri name')
                                .populate('composer', 'uri fullname')
                                .populate('opus', 'uri periods identifier')
                                .exec(function (err, scores) {
                                    var results = [];
                                    _(scores).each(function (score) {
                                        results.push({
                                            opus: score.get('opus'),
                                            score: score,
                                            instruments: score.get('instruments')||[],
                                            composer: score.get('composer'),
                                            periods: score.get('opus.periods').map(function (pId) {
                                                    return periodById[pId];
                                                }).filter(function (p) { return !!p; })
                                        });
                                    });
                                    resultsPromise.resolve(null, results);
                                });
                    });
            } else {
                resultsPromise.resolve(null, null);
            }
        });

    mongoose.Promise
        .when(resultsPromise, allPeriodsPromise, allInstrumentsPromise)
        .addBack(function (err, results, allPeriods, allInstruments) {
            res.render('main-advancedSearch.html', {
                p: p,
                ipp: ipp,
                originalUrl: req.originalUrl,
                results: results,
                allPeriods: allPeriods,
                allInstruments: allInstruments,
                search_for: arg_search_for,
                composer_name: arg_composer_name,
                opus_identifier: arg_opus_identifier,
                score_title: arg_score_title,
                periods: arg_periods,
                instruments: arg_instruments,
                title: 'Advanced Search',
                scripts: ['init/main-advancedSearch.js']
            });
        });
};

exports.about = function (req, res) {
    res.render('main-about.html', { title: 'About' });
};

exports.legal = function (req, res) {
    res.render('main-legal.html', { title: 'Privacy Policy' });
};

exports.googleVerification = function (req, res) {
    res.render('main-googleVerification.html', { layout: null });
};

exports.error404 = function (req, res) {
    res.status(404);
    res.render('error-404.html', { q: 'something', title: 'Not Found' });
};
