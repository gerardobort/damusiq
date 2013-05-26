
/*
 * handle composer pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.landing = function(req, res){
    var composerUri = req.route.params.composerUri;
    
    mongoose.model('Composer')
        .findOne({ uri: composerUri })
        .populate('categories')
        .populate('opuses')
        .exec(function (err, composer) {
            if (composer) {
                res.render('composer-landing.html', {
                    title: 'PDF scores for free!',
                    composer: composer
                });
            } else {
                res.send('composer not found');
            }
        });
};

exports.opus = function(req, res){
    var composerUri = req.route.params.composerUri,
        opusUri = req.route.params.opusUri;
    
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
                                    res.render('composer-opus.html', {
                                        title: 'PDF scores for free!',
                                        opus: opus,
                                        scores: scores
                                    });
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

