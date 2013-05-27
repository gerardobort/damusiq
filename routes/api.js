
/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.autocomplete = function(req, res){
    var q = req.route.params.q,
        data = [],
        reqs = 2;

    function completeRequest() {
        if (--reqs > 0) {
            return;
        }
        res.send(JSON.stringify(data));
    }

    mongoose.model('Composer').find({
            '$or': [
                { firstname: new RegExp('^' + q, 'i') },
                { lastname: new RegExp('^' + q, 'i') },
                { fullname: new RegExp('\W' + q, 'i') }
            ]
        }, 'uri fullname', function (err, composers) {
            (composers||[]).forEach(function (composer) {
                data.push({ type: 'composer', title: composer.get('fullname'), url: global.helpers.url({ composerUri: composer.get('uri') }) });
            });
            completeRequest();
    });

    mongoose.model('ComposerCategory')
        .find({
            lang: req.lang,
            name: new RegExp('^' + q, 'i')
        }, 'uri name', function (err, categories) {
            (categories||[]).forEach(function (category) {
                data.push({ type: 'composer-category', title: category.get('name'), url: global.helpers.url({ categoryUri: category.get('uri') }) });
            });
            completeRequest();
    });
};

