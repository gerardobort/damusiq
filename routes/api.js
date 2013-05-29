
/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.autocomplete = function(req, res){
    var q = req.route.params.q,
        data = [],
        reqs = 2;

    function completeRequest() {
        if (--reqs > 0) {
            return;
        }
        res.send(data);
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
        }, 'uri name', function (err, categories) {
            (categories||[]).forEach(function (category) {
                data.push({ type: 'composer-category', title: category.get('name'), url: global.helpers.url({ categoryUri: category.get('uri') }) });
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
                text: '<p>Intro body text goes here, some HTML is ok</p>',
                asset: {
                    media: 'https://secure.gravatar.com/avatar/6be4403f35cc2a8a1409e2990acc5dd6?s=420&d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png',
                    credit: '&copy; 2013 pdf-scores.com',
                    caption: 'PDF SCORES'
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
                .exec(function (err, composers) {

                    composers.forEach(function (composer) {
                        data.timeline.date.push({
                            startDate: composer.get('birth_year') + ',01,01',
                            endDate: composer.get('death_year') + ',01,01',
                            headline: '<a href="'
                                + global.helpers.url({ composerUri: composer.get('uri') })
                                + '">' + composer.get('fullname') + '</a>',
                            text: composer.get('wiki.' + req.lang + '.content'),
                            tag: composer.get('categories').map(function (cat) {
                                if (cat.get('name') !== category.get('name')) {
                                    return cat.get('name');
                                }
                            }),
                            classname: 'composer-' + composer.get('uri'),
                            asset: {
                                media: (composer.get('images')||[])[0],
                                thumbnail: (composer.get('images')||[])[0],
                                credit: '',
                                caption: ''
                            }
                        });
                    });

                    res.send(data);
                });
        });
};
