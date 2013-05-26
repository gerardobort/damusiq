
/*
 * handle main pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.bootstrap = function(req, res, next){
    // parse domain / subdomain and perform 301 redirections, or get language
    next();
};

exports.homepage = function(req, res){
console.log(req.caca)
    mongoose.model('Composer').find({}, 'uri fullname', function (err, composers) {
        res.render('main-homepage.html', {
            composers: composers,
            title: 'PDF scores for free!'
        });
    });
};

exports.composerCategories = function(req, res){
    var categoryUri = req.route.params.categoryUri;

    mongoose.model('ComposerCategory')
        .findOne({ 'uri': categoryUri }, '_id', function (err, category) {
            mongoose.model('Composer')
                .find({ categories: category.get('_id') }, 'uri fullname', function (err, composers) {
                    res.render('main-homepage.html', {
                        composers: composers,
                        title: 'PDF scores for free! - ' + categoryUri
                    });
                });
        });
};


