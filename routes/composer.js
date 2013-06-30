
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
                data.keywords = [
                    composer.get('fullname'),
                    (composer.get('lastname')||composer.get('fullname')) + ' scores pdf',
                    composer.get('fullname') + ' music scores'
                ];
                data.composer = composer;
                data.wiki = composer.get('wiki.' + req.lang);
                data.categories = composer.get('categories');
                data.periods = composer.get('periods');
                completeRequest();
            } else {
                res.status(404);
                res.render('error-404.html');
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

    var youtubeCriteria = (composerUri + ' ' + opusUri).replace(/-+/g, ' '),
        youtubeService = require(__dirname + '/../services/youtube'),
        youtubeResultsPromise = youtubeService.search(youtubeCriteria);

    youtubeResultsPromise.addBack(function (err, results) {
        if (results) {
            data.videos = results;
        }
        completeRequest();
    })
    
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
                                    data.keywords = [
                                        (composer.get('lastname')||composer.get('fullname')) + ' ' 
                                            + opus.get('name').replace(/,( *)/g, '$1'),
                                        (composer.get('lastname')||composer.get('fullname')) + ' '
                                            + (opus.get('identifier')||'') + ' ' 
                                            + opus.get('name').replace(/,( *)/g, '$1') + ' pdf',
                                        opus.get('name').replace(/,( *)/g, '$1') + ' ' 
                                            + composer.get('lastname') + ' free pdf'
                                    ];
                                    data.opus = opus,
                                    data.scores = scores;
                                    completeRequest();

                                });
                        } else {
                            res.status(404);
                            res.render('error-404.html');
                        }
                    });

            } else {
                res.status(404);
                res.render('error-404.html');
            }
        });

};

exports.score = function(req, res) {
    var scoreId = req.route.params.scoreId;

    mongoose.model('Score')
        .findOne({ _id: scoreId })
        .populate('composer')
        .populate('opus')
        .populate('instruments')
        .exec(function (err, score) {
            var data = {};
            if (score) {
                var keywords = [
                    (score.get('composer.lastname')||score.get('composer.fullname')) 
                        + ' ' + score.get('opus.name').replace(/,( *)/g, '$1'),
                    score.get('opus.name').replace(/,( *)/g, '$1') + ' pdf'
                ];
                if (score.get('opus.identifier')) {
                    keywords.push(score.get('composer.fullname') + ' ' 
                        + score.get('opus.identifier').replace(/,( *)/g, '$1') + ' pdf')
                }
                keywords = keywords.concat(_(score.get('instruments')).map(function (instrument, i) {
                    return score.get('opus.name').replace(/,( *)/g, '$1') + ' ' 
                        + (score.get('composer.lastname')||'') + ' ' + instrument.get('name') + ' pdf'
                }));
                res.render('composer-score.html', {
                    title: score.get('opus.name') + ' by ' + score.get('composer.fullname'),
                    keywords: keywords,
                    composer: score.get('composer'),
                    opus: score.get('opus'),
                    score: score,
                    urlBasePath: 'http://' + req.headers.host
                });
            } else {
                res.status(404);
                res.render('error-404.html');
            }
        });

};

