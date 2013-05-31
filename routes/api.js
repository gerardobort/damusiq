
/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.autocomplete = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        q = url_parts.query.q.sanitize(),
        data = [],
        reqs = 2;

    function completeRequest() {
        if (--reqs > 0) {
            return;
        }
        res.send({ results: data });
    }

    mongoose.model('Composer').find({
            '$or': [
                { firstname: new RegExp('^' + q, 'i') },
                { lastname: new RegExp('^' + q, 'i') },
                { fullname: new RegExp('(^|\W)' + q, 'i') }
            ]
        }, 'uri fullname', function (err, composers) {
            (composers||[]).forEach(function (composer) {
                data.push({ type: 'composer', id: composer.get('_id').toString(), name: composer.get('fullname'), url: global.helpers.url({ composerUri: composer.get('uri') }) });
            });
            completeRequest();
    });

    mongoose.model('ComposerCategory')
        .find({
            lang: req.lang,
            name: new RegExp('(^|\W)' + q, 'i')
        }, 'uri name', function (err, categories) {
            (categories||[]).forEach(function (category) {
                data.push({ type: 'composer-category', id: category.get('_id').toString(), name: category.get('name'), url: global.helpers.url({ categoryUri: category.get('uri') }) });
            });
            completeRequest();
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
                                + ' <a href="'
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
