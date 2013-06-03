
/*
 * handle main pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.bootstrap = function(req, res, next){
    // parse domain / subdomain and perform 301 redirections, or get language
    res.lang = req.lang = 'en' || 'en';
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
                title: 'PDF scores for free!'
            });
        });
};

exports.search = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        q = url_parts.query.q.sanitize(),
        data = [],
        reqs = 2;

    function completeRequest() {
        if (--reqs > 0) {
            return;
        }
        if (1 === data.length) {
            res.redirect(301, data[0].url);
        }
        res.render('main-search.html', {
            results: data,
            title: 'Search results for ' + q,
            q: q
        });
    }

    mongoose.model('Composer').find({
            '$or': [
                { firstname: new RegExp('^' + q, 'i') },
                { lastname: new RegExp('^' + q, 'i') },
                { fullname: new RegExp('(^|\W)' + q, 'i') }
            ]
        }, 'uri fullname', function (err, composers) {
            (composers||[]).forEach(function (composer) {
                data.push({ type: 'composer', title: composer.get('fullname'), url: global.helpers.url({ composerUri: composer.get('uri') }) });
            });
            completeRequest();
    });

    mongoose.model('ComposerCategory')
        .find({
            lang: req.lang,
            name: new RegExp('(^|\W)' + q, 'i')
        }, 'uri name count', function (err, categories) {
            (categories||[]).forEach(function (category) {
                data.push({ type: 'composer-category', title: category.get('name'), url: global.helpers.url({ categoryUri: category.get('uri') }) });
            });
            completeRequest();
    });
};
