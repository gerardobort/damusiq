
/*
 * handle composer pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.landing = function(req, res){
    var composerName = req.route.params.composerName;
    
    mongoose.model('Composer').findOne({ uri: composerName }, function (err, doc) {
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
    res.render('composer-opus.html', { title: 'PDF scores for free!' });
};

