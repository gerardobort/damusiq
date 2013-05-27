
/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.bootstrap = function(req, res, next){
    // parse domain / subdomain and perform 301 redirections, or get language
    global.lang = 'en' || 'en';
    next();
};

exports.autocomplete = function(req, res){
    var q = req.route.params.q,
        data = [],
        reqs = 2;

console.log(q);
    function completeRequest() {
console.log(data);
        if (--reqs > 0) {
            return;
        }
console.log('send', data);
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
                data.push({ name: composer.get('fullname'), url: '/' + composer.get('uri') });
            });
            completeRequest();
    });

    mongoose.model('ComposerCategory')
        .find({
            lang: global.lang,
            name: new RegExp('^' + q, 'i')
        }, 'uri name', function (err, categories) {
            (categories||[]).forEach(function (category) {
                data.push({ name: category.get('name'), url: '/composers/' + category.get('uri') });
            });
            completeRequest();
    });
};

