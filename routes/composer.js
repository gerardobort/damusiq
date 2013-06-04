
/*
 * handle composer pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');

exports.landing = function(req, res){
    var composerUri = req.route.params.composerUri,
        reqs = 2,
        data = { twitts: null };

    function completeRequest() {
        if (--reqs > 0) {
            return;
        }
        res.render('composer-landing.html', data);
    }

    var http = require('http'),
        twApiUrl = 'http://search.twitter.com/search.json?rpp=10&q=$q',
        twUrl = twApiUrl.replace('$q', escape(composerUri.replace(/-+/g, ' ')));

    http.get(twUrl, function (res) {
            var body = '';
            res.on('data', function (chunk) { body += chunk; });
            res.on('end', function (chunk) {
                var twJSON = JSON.parse(body);
                    entries = [];
                twJSON && twJSON.results && twJSON.results.forEach(function(entry, i) {
                    entries.push({
                        thumbnail_url: entry.profile_image_url,
                        username: entry.from_user,
                        link_url: 'http://twitter.com/' + entry.from_user,
                        text: entry.text
                    });
                });
                if (entries.length) {
                    data.twitts = entries;
                }
                completeRequest();
            });
        })
        .on('error', function (error) {
            completeRequest();
        });
    
    mongoose.model('Composer')
        .findOne({ uri: composerUri })
        .populate('categories', 'uri name', { lang: req.lang }, { sort: [[ 'name', 1 ]] })
        .populate('periods', 'uri name', { }, { sort: [[ 'name', 1 ]] })
        .populate('opuses', 'uri name identifier scores', { }, { sort: [[ 'order_index', 1 ]] })
        .exec(function (err, composer) {
            if (composer) {
                data.title = composer.get('fullname');
                data.composer = composer;
                data.wiki = composer.get('wiki.' + req.lang);
                data.categories = composer.get('categories');
                data.periods = composer.get('periods');
                completeRequest();
            } else {
                res.send('composer not found');
            }
        });
};

exports.opus = function(req, res){
    var composerUri = req.route.params.composerUri,
        opusUri = req.route.params.opusUri,
        reqs = 2,
        data = { videos: null };

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
                var ytJSON = JSON.parse(body);
                    entries = [];
                ytJSON && ytJSON.feed && ytJSON.feed.entry && ytJSON.feed.entry.forEach(function(entry, i) {
                    entries.push({
                        youtube_id: entry.id.$t.replace(/^.*videos\/([^\/]+)$/, '$1'),
                        thumbnail_url: entry.media$group.media$thumbnail[0].url,
                        link_url: entry.link[0].href,
                        title: entry.media$group.media$title.$t
                    });
                });
                if (entries.length) {
                    data.videos = entries;
                }
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

exports.score = function(req, res){
    var scoreId = req.route.params.scoreId;

    mongoose.model('Score')
        .findOne({ _id: scoreId })
        .populate('composer')
        .populate('opus')
        .populate('instruments')
        .exec(function (err, score) {
            var data = {};
            res.render('composer-score.html', {
                title: score.get('opus.name') + ' by ' + score.get('composer.fullname'),
                composer: score.get('composer'),
                opus: score.get('opus'),
                score: score,
                urlBasePath: 'http://' + req.headers.host
            });
        });

};

