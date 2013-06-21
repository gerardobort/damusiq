
/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.autocomplete = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        q = (url_parts.query.q||'').sanitize(),
        _ = require('underscore');

    mongoose.Promise
        .when(
            mongoose.model('Composer')
                .find({
                    fullname: new RegExp('(' + q.split(' ').join('|') + ')\w*', 'i')
                }, 'uri fullname').exec()
            ,
            mongoose.model('ComposerCategory')
                .find({
                    lang: req.lang,
                    name: new RegExp('(' + q.split(' ').join('|') + ')\w*', 'i')
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

            res.send({ results: categoryResults.concat(composerResults) });
        });

};


exports.composerCategoryTimeline = function(req, res){
    var categoryUri = req.route.params.categoryUri,
        data = {
            timeline: {
                headline: 'Headline',
                type: 'default',
                text: '<p>Navigate through this category of composers also classified by periods,'
                    + ' or explore more <a href="/">categories here</a></p>',
                asset: {
                    //media: 'https://secure.gravatar.com/avatar/6be4403f35cc2a8a1409e2990acc5dd6?s=420&d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png',
                    credit: '&copy; 2013 pdf-scores.com',
                    caption: 'PDF Scores'
                },
                date: [],
                era: []
            }
        };

    mongoose.model('ComposerCategory')
        .findOne({ 'uri': categoryUri }, function (err, category) {

            data.timeline.headline = category.get('name');

            mongoose.model('Composer')
                .find({ categories: category.get('_id') })
                .populate('categories', 'uri name', { lang: req.lang }, { sort: [[ 'name', 1 ]] })
                .populate('periods') //, 'uri name', { }, { sort: [[ 'name', 1 ]] })
                .exec(function (err, composers) {
                    composers.forEach(function (composer) {
                        var tag = composer.get('periods').map(function (period) {
                                    return period.get('name');
                                })[0],
                            text = (composer.get('wiki.' + req.lang + '.content')||'').crop(240)
                                + ' <br/><a href="'
                                + global.helpers.url({ composerUri: composer.get('uri') })
                                + '">' + composer.get('opuses').length + ' available opuses</a>';


                        data.timeline.date.push({
                            startDate: composer.get('birth_year') + ',01,01',
                            endDate: composer.get('death_year') + ',01,01',
                            headline: '<a href="'
                                + global.helpers.url({ composerUri: composer.get('uri') })
                                + '">' + composer.get('fullname') + '</a>',
                            text: text,
                            tag: tag,
                            classname: 'composer-' + composer.get('uri'),
                            asset: {
                                media: (composer.get('images')||[])[0],
                                thumbnail: (composer.get('images')||[])[0],
                                credit: '',
                                caption: ''
                            }
                        });

                        data.timeline.era.push({
                            startDate: composer.get('birth_year') + ',01,01',
                            endDate: composer.get('death_year') + ',01,01',
                            headline: composer.get('fullname'),
                            tag: tag
                        });
                    });

                    res.send(data);
                });
        });
};

exports.imageJpg = function(req, res){
    var imageUri = req.route.params.imageUri,
        _ = require('underscore');

    var http = require('http'),
        searchApiUrl = 'http://en.wikipedia.org/w/api.php?action=query&titles=$q&prop=images&imlimit=10&format=json',
        searchUrl = searchApiUrl.replace('$q', escape(imageUri.replace(/-+/g, ' '))),
        detailApiUrl = 'http://en.wikipedia.org/w/api.php?action=query&titles=$q&prop=imageinfo&iiprop=url&format=json',
        detailUrl = '';

    http.get(searchUrl, function (res1) {
            var body = '';
            res1.on('data', function (chunk) { body += chunk; });
            res1.on('end', function (chunk) {
                var searchJSON = JSON.parse(body);

                var imageName = _(_(searchJSON.query.pages).map(function (page, pageNumber) {
                    var jpgImages = _(page.images).filter(function (image) {
                        return image.title.substr(-4, 4) === '.jpg';
                    });
                    if (!jpgImages.length && page.images && page.images.length) {
                        console.log(page.images[0].title);
                        return page.images[0].title;
                    }
                    return _(jpgImages).first() ? _(jpgImages).first().title : '';
                })).first();

                if (imageName) {

                    detailUrl = detailApiUrl.replace('$q', escape(imageName));
                    http.get(detailUrl, function (res2) {
                            var body = '';
                            res2.on('data', function (chunk) { body += chunk; });
                            res2.on('end', function (chunk) {
                                var searchJSON = JSON.parse(body);

                                var imageUrl = _(_(searchJSON.query.pages).map(function (page, pageNumber) {
                                    return _(page.imageinfo).first().url;
                                })).first();

                                res.redirect(imageUrl);
                                
                            });
                        })
                        .on('error', function (error) {
                            res.status(404);
                            res.render('error-404.html');
                        });
                } else {
                    res.status(404);
                    res.render('error-404.html');
                }
                
            });
        })
        .on('error', function (error) {
            res.status(404);
            res.render('error-404.html');
        });
    
};
