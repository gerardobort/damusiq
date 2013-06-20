/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    mongooseWhen = require('mongoose-when'),
    mainRoute = require('./routes/main'),
    composerRoute = require('./routes/composer'),
    categoryRoute = require('./routes/category'),
    periodRoute = require('./routes/period'),
    instrumentRoute = require('./routes/instrument'),
    apiRoute = require('./routes/api'),
    sitemapRoute = require('./routes/sitemap');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('uinexpress').__express)
app.engine('xml', require('uinexpress').__express)
app.set('view engine', 'html')
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// mongo and models
app.set('db', mongoose.connect(process.env.MONGOHQ_URL));
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
    if (file.match(/\.js$/)) {
        require(models_path+'/'+file);
    }
});

global.helpers = require('./helpers');

// routes
app.get('/', mainRoute.bootstrap, mainRoute.homepage);
app.get('/about.html', mainRoute.bootstrap, mainRoute.about);
app.get('/legal.html', mainRoute.bootstrap, mainRoute.legal);
app.get('/api/autocomplete', mainRoute.bootstrap, apiRoute.autocomplete);
app.get('/api/image/:imageUri.jpg', mainRoute.bootstrap, apiRoute.imageJpg);
app.get('/api/composer-category-timeline/:categoryUri', mainRoute.bootstrap, apiRoute.composerCategoryTimeline);
app.get('/search.html', mainRoute.bootstrap, mainRoute.search);
app.get('/instruments.html', mainRoute.bootstrap, instrumentRoute.landing);
app.get('/instruments/:instrumentUri.html', mainRoute.bootstrap, instrumentRoute.detail);
app.get('/periods.html', mainRoute.bootstrap, periodRoute.landing);
app.get('/periods/:periodUri.html', mainRoute.bootstrap, periodRoute.detail);
app.get('/composers.html', mainRoute.bootstrap, categoryRoute.landing);
app.get('/composers/:categoryUri.html', mainRoute.bootstrap, categoryRoute.detail);
//app.get('/instruments/:instrumentUri.html', mainRoute.bootstrap, mainRoute.instruments);
app.get('/:composerUri.html', mainRoute.bootstrap, composerRoute.landing);
app.get('/:composerUri/:opusUri.html', mainRoute.bootstrap, composerRoute.opus);
app.get('/:composerUri/:opusUri/:scoreId.html', mainRoute.bootstrap, composerRoute.score);
app.get('/sitemap.xml', mainRoute.bootstrap, sitemapRoute.main);
app.get('/sitemap-categories.xml', mainRoute.bootstrap, sitemapRoute.categories);
app.get('/sitemap-periods.xml', mainRoute.bootstrap, sitemapRoute.periods);
app.get('/sitemap-composers.xml', mainRoute.bootstrap, sitemapRoute.composers);
app.get('/sitemap-instruments.xml', mainRoute.bootstrap, sitemapRoute.instruments);
app.use(mainRoute.bootstrap, mainRoute.error404);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port') + ' on ' + app.get('env') + ' env.');
});
