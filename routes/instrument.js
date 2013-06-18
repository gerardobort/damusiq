
/*
 * handle main pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.landing = function(req, res){

    mongoose.model('Instrument')
        .find({ }, 'uri name')
        .exec(function (err, instruments) {
            res.render('instrument-landing.html', {
                instruments: instruments,
                title: 'Instruments',
                og_title: 'Instruments',
                scripts: [
                ]
            });
        });

};

exports.detail = function(req, res){
    var instrumentUri = req.route.params.instrumentUri;


    mongoose.model('Instrument')
        .findOne({ 'uri': instrumentUri }, 'uri name')
        .exec(function (err, instrument) {

            if (instrument) {
                res.send(instrument);
                /*
                mongoose.model('Composer')
                    .find({ 'periods': period.get('_id') }, 'uri fullname')
                    .exec(function (err, composers) {
                        res.render('period-detail.html', {
                            composers: composers,
                            title: period.name,
                            og_title: period.name,
                            scripts: [
                            ]
                        });
                    });
                */
            } else {
                res.status(404);
                res.render('error-404.html');
            }
        });

};
