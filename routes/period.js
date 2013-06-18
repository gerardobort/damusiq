
/*
 * handle main pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.landing = function(req, res){

    mongoose.model('Period')
        .find({ })
        .sort({ order_index: 1 })
        .exec(function (err, periods) {
            res.render('period-landing.html', {
                periods: periods,
                title: 'Periods',
                og_title: 'Periods',
                scripts: [
                ]
            });
        });

};

exports.detail = function(req, res){
    var periodUri = req.route.params.periodUri;


    mongoose.model('Period')
        .findOne({ 'uri': periodUri })
        .exec(function (err, period) {
            if (period) {
                mongoose.model('Composer')
                    .find({ 'periods': period.get('_id') }, 'uri fullname')
                    .exec(function (err, composers) {
                        res.render('period-detail.html', {
                            composers: composers,
                            period: period,
                            title: period.get('name'),
                            og_title: period.get('name'),
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
