
/*
 * handle composer pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');

exports.landing = function(req, res){
    var composerUri = req.route.params.composerUri;
    
    mongoose.model('Composer')
        .findOne({ uri: composerUri })
        .populate('categories')
        .populate('opuses')
        .exec(function (err, composer) {
            if (composer) {
                res.render('composer-landing.html', {
                    title: composer.get('fullname'),
                    composer: composer,
                    wiki: composer.get('wiki.' + req.lang),
                    categories: _.filter(composer.get('categories'), function (cat) {
                        return cat.get('lang') === req.lang;
                    })
                });
            } else {
                res.send('composer not found');
            }
        });
};

exports.opus = function(req, res){
    var composerUri = req.route.params.composerUri,
        opusUri = req.route.params.opusUri,
        reqs = 2,
        data = {};

    function completeRequest() {
        if (--reqs > 0) {
            return;
        }
        res.render('composer-opus.html', data);
    }

    var http = require('http'),
        ytApiUrl = 'http://gdata.youtube.com/feeds/api/videos?max-results=8&format=5&alt=json&q=$q',
        ytUrl = ytApiUrl.replace('$q', escape((composerUri + ' ' + opusUri).replace(/-+/g, ' ')));

    http.get(ytUrl, function (res) {
            var body = '';
            res.on('data', function (chunk) { body += chunk; });
            res.on('end', function (chunk) {
                data.ytJSON = JSON.parse(body);
                completeRequest();
            });
        })
        .on('error', function (error) {
            completeRequest();
        });
    
    mongoose.model('Composer')
        .findOne({ 'uri': composerUri })
        .exec(function (err, composer) {
            if (composer) {

                mongoose.model('Opus')
                    .findOne({ uri: opusUri, 'composer': composer.get('_id') })
                    .populate('composer')
                    .populate('periods')
                    .exec(function (err, opus) {
                        if (opus) {
                            mongoose.model('Score')
                                .find({ opus: opus.get('_id') })
                                .populate('instruments')
                                .exec(function (err, scores) {

                                    data.title = opus.get('name') + ' by ' + composer.get('fullname'),
                                    data.opus = opus,
                                    data.scores = scores;
                                    completeRequest();

                                });
                        } else {
                            res.send('opus not found');
                        }
                    });

            } else {
                res.send('composer not found');
            }
        });
};

