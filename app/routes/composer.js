
/*
 * handle composer pages.
 */

exports.landing = function(req, res){
    res.render('composer-landing.html', { title: 'PDF scores for free!' });
};

exports.opus = function(req, res){
    res.render('composer-opus.html', { title: 'PDF scores for free!' });
};
