
/*
 * handle category pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.category = function(req, res) {
    var categoryUri = req.route.params.categoryUri;

    mongoose.model('ComposerCategory')
        .find({ lang: req.lang }, 'uri name count')
        .sort({ count: -1 })
        .exec(function (err, categories) {
            res.render('sitemap-category.html', {
                categories: categories,
                layout: null
            });
        });

};
