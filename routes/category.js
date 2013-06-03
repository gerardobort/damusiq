
/*
 * handle category pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.landing = function(req, res){
    var categoryUri = req.route.params.categoryUri;

    mongoose.model('ComposerCategory')
        .find({ lang: req.lang }, 'uri name count')
        .sort({ count: -1 })
        .exec(function (err, categories) {
            res.render('category-landing.html', {
                categories: categories,
                title: 'Categories',
                og_title: 'Categories',
                scripts: [
                ]
            });
        });

};

exports.detail = function(req, res){
    var categoryUri = req.route.params.categoryUri;

    mongoose.model('ComposerCategory')
        .findOne({ 'uri': categoryUri })
        .exec(function (err, category) {

            function getRelatedCategoriesRegexp(name) {
                var keywords = name.match(/\w+/g).filter(function(w){ return !w.match(/(composers?|stubs?|musics?)/i) && w.length > 3; })
                return new RegExp('(' + keywords.join('|') + ')', 'i');
            }

            mongoose.Promise
                .when(
                    mongoose.model('ComposerCategory')
                        .find({ name: getRelatedCategoriesRegexp(category.get('name')), lang: req.lang }, 'uri name')
                        .sort({ name: 1 })
                        .exec()
                    ,
                    mongoose.model('Composer')
                        .find({ categories: category.get('_id') }, 'uri fullname birth_year')
                        .exec()
                )
                .addBack(function (err, categories, composers) {
                    res.render('category-detail.html', {
                        related_categories: categories,
                        category: category,
                        composers: composers,
                        title: category.get('name'),
                        og_title: category.get('name'),
                        scripts: [
                            '/library/timeline/compiled/js/storyjs-embed.js',
                            '/init/composer-categories.js',
                        ]
                    });
                });
        });

};
