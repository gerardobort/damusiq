
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
        .exec(function (err, doc) {
            if (doc) {
                res.render('composer-landing.html', {
                    title: 'PDF scores for free!',
                    doc: doc
                });
            } else {
                res.send('composer not found');
            }
        });
};

exports.opus = function(req, res){
    var composerUri = req.route.params.composerUri,
        opusUri = req.route.params.opusUri;
    
    mongoose.model('Opus')
        .findOne({ uri: opusUri, 'composer.uri': composerUri })
        .populate('scores')
        .populate('instruments')
        .populate('periods')
        .exec(function (err, doc) {
            if (doc) {
                res.render('composer-opus.html', {
                    title: 'PDF scores for free!',
                    doc: doc
                });
            } else {
                res.send('composer not found');
            }
        });
};

