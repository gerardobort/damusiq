/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    mainRoute = require('./routes/main'),
    composerRoute = require('./routes/composer'),
    userRoute = require('./routes/user'),
    apiRoute = require('./routes/api');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('uinexpress').__express)
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
app.get('/api/autocomplete/:q', mainRoute.bootstrap, apiRoute.autocomplete);
app.get('/api/composer-category-timeline/:categoryUri', mainRoute.bootstrap, apiRoute.composerCategoryTimeline);
app.get('/search.html', mainRoute.bootstrap, mainRoute.search);
app.get('/users', mainRoute.bootstrap, userRoute.list);
app.get('/composers/:categoryUri.html', mainRoute.bootstrap, mainRoute.composerCategories);
//app.get('/instruments/:instrumentUri.html', mainRoute.bootstrap, mainRoute.instruments);
app.get('/:composerUri.html', mainRoute.bootstrap, composerRoute.landing);
app.get('/:composerUri/:opusUri.html', mainRoute.bootstrap, composerRoute.opus);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port') + ' on ' + app.get('env') + ' env.');
});
