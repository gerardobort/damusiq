
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
                
                mongoose.model('Score')
                    .find({
                            instruments: instrument.get('_id'),
                            name: new RegExp(instrument.get('name'))
                        },
                        'uri name opus composer instruments'
                    )
                    .populate('opus', 'uri name')
                    .populate('composer', 'uri fullname')
                    .populate('instruments', 'uri name')
                    .sort({ 'views': -1 }) // TODO
                    .limit(1000)
                    .exec(function (err, scores) {
                        res.render('instrument-detail.html', {
                            instrument: instrument,
                            random_scores: scores,
                            title: instrument.name,
                            og_title: instrument.name,
                            scripts: [
                            ]
                        });
                    });

            } else {
                res.status(404);
                res.render('error-404.html');
            }
        });

};
