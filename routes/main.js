
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
    mongoose.model('ComposerCategory')
        .find({ lang: req.lang }, 'uri name count')
        .sort({ count: -1 })
        .exec(function (err, categories) {
            res.render('main-homepage.html', {
                categories: categories,
                title: 'PDF scores for free!'
            });
        });
};

exports.composerCategories = function(req, res){
    var categoryUri = req.route.params.categoryUri;

    mongoose.model('ComposerCategory')
        .findOne({ 'uri': categoryUri }, function (err, category) {
            mongoose.model('Composer')
                .find({ categories: category.get('_id') }, 'uri fullname birth_year', function (err, composers) {
                    res.render('composer-categories.html', {
                        category: category,
                        composers: composers,
                        title: category.get('name'),
                        og_title: category.get('name'),
                        scripts: [
                            '/library/TimelineJS/compiled/js/storyjs-embed.js',
                            '/init/composer-categories.js',
                        ]
                    });
                });
        });
};


exports.search = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        q = url_parts.query.q,
        data = [],
        reqs = 2;

    function completeRequest() {
        if (--reqs > 0) {
            return;
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
                { fullname: new RegExp('\W' + q, 'i') }
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
            name: new RegExp('^' + q, 'i')
        }, 'uri name count', function (err, categories) {
            (categories||[]).forEach(function (category) {
                data.push({ type: 'composer-category', title: category.get('name'), url: global.helpers.url({ categoryUri: category.get('uri') }) });
            });
            completeRequest();
    });
};
