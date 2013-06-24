
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
    res.locals.og_title = 'Damusiq: Musiq library for enthusiasts!';
    res.locals.og_image = 'http://damusiq.com/images/og-image.png';
    res.locals.og_description = 'Explore, Find, Listen and Share academic Music and Download scores for free!';

    var url = require('url'),
        url_parts = url.parse(req.url, true);
        q = url_parts.pathname.replace(/(\/|\.html)/g, ' ').trim();

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
        ], function (req, composers) {
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
        q = (url_parts.query.q||'').sanitize();

    res.render('main-advancedSearch.html', {
        q: q,
        results: [],
        scripts: ['init/main-advancedSearch.js']
    });
};

exports.about = function (req, res) {
    res.render('main-about.html');
};

exports.legal = function (req, res) {
    res.render('main-legal.html');
};

exports.googleVerification = function (req, res) {
    res.render('main-googleVerification.html', { layout: null });
};

exports.error404 = function (req, res) {
    res.status(404);
    res.render('error-404.html', { q: 'something' });
};
