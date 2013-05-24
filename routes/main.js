
/*
 * handle main pages.
 */

exports.homepage = function(req, res){
    res.render('main-homepage.html', { title: 'PDF scores for free!' });
};
