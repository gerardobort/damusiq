
/*
 * handle main pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.landing = function(req, res){

    res.render('period-landing.html', {
        title: 'Periods',
        og_title: 'Periods',
        scripts: [
        ]
    });

};

exports.detail = function(req, res){
    var periodUri = req.route.params.periodUri;


    mongoose.model('Period')
        .findOne({ 'uri': periodUri }, 'uri name')
        .exec(function (err, period) {
            if (period) {
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
            } else {
                res.status(404);
                res.render('error-404.html');
            }
        });

};
