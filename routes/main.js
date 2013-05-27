
/*
 * handle main pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.bootstrap = function(req, res, next){
    // parse domain / subdomain and perform 301 redirections, or get language
    req.lang = 'en' || 'en';
    next();
};

exports.homepage = function(req, res){
    mongoose.model('Composer').find({}, 'uri fullname', function (err, composers) {
        res.render('main-homepage.html', {
            composers: composers,
            title: 'PDF scores for free!'
        });
    });
};

exports.homepage2 = function(req, res){
    mongoose.model('ComposerCategory')
        .find({ lang: req.lang }, 'uri name count')
        .sort({ count: -1 })
        .exec(function (err, categories) {
            res.render('main-homepage2.html', {
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
                        og_title: category.get('name')
                    });
                });
        });
};


