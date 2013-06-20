
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
    res.locals.title_prepend = 'Damusiq';
    res.locals.title = '';
    res.locals.og_title = 'Damusiq: Musiq library for enthusiasts!';
    res.locals.og_image = 'http://damusiq.com/images/og-image.png';
    res.locals.og_description = 'Find, share and download academic music scores for free!';
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
        q = url_parts.query.q.sanitize();

    mongoose.Promise
        .when(
            mongoose.model('Composer')
                .find({
                    '$or': [
                        { firstname: new RegExp('^' + q, 'i') },
                        { lastname: new RegExp('^' + q, 'i') },
                        { fullname: new RegExp('(^|\W)' + q, 'i') }
                    ]
                }, 'uri fullname').exec()
            ,
            mongoose.model('ComposerCategory')
                .find({
                    lang: req.lang,
                    name: new RegExp('(^|\W)' + q, 'i')
                }, 'uri name').exec()
        )
        .addBack(function (err, composerResults, categoryResults) {

            composerResults = (composerResults||[]).map(function (composer) {
                return {
                    type: 'composer',
                    id: composer.get('_id').toString(),
                    name: composer.get('fullname'),
                    url: global.helpers.url({ composerUri: composer.get('uri') })
                };
            });

            categoryResults = (categoryResults||[]).map(function (category) {
                return {
                    type: 'composer-category',
                    id: category.get('_id').toString(),
                    name: category.get('name'),
                    url: global.helpers.url({ categoryUri: category.get('uri') })
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

exports.about = function (req, res) {
    res.render('main-about.html');
};

exports.legal = function (req, res) {
    res.render('main-legal.html');
};

exports.error404 = function (req, res) {
    res.status(404);
    res.render('error-404.html');
};
