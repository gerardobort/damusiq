
/*
 * handle main pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.homepage = function(req, res){
    mongoose.model('Composer').find({}, 'uri fullname', function (err, docs) {
        res.render('main-homepage.html', {
            composers: docs,
            title: 'PDF scores for free!'
        });
    });
};
