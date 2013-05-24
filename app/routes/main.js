
/*
 * handle main pages.
 */

exports.homepage = function(req, res){
    res.render('index.html', { title: 'PDF scores for free!' });
};
