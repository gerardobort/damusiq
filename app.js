/**
 * Module dependencies.
 */

var express = require('express'),
    mainRoute = require('./routes/main'),
    composerRoute = require('./routes/composer'),
    userRoute = require('./routes/user'),
    http = require('http'),
    path = require('path');

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

app.get('/', mainRoute.homepage);
app.get('/users', userRoute.list);
app.get('/:composer_name', composerRoute.landing);
app.get('/:composer_name/:opus_name', composerRoute.opus);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port') + ' on ' + app.get('env') + ' env.');
});
