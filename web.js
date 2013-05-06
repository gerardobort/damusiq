var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send('pdf-scores.com - try <a href="/composer">this page</a>');
});


// -- mongoose test
var mongoose = require('mongoose'),
    db = mongoose.connect('mongodb://bort:123@dharma.mongohq.com:10048/pdfscores_dev'),
    Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

    var ComposerSchema = new Schema({
            id: ObjectId,
            name: String
        }),
        Composer = db.model('Composer', ComposerSchema, 'composer');

    app.get('/composer', function(request, response) {
        var responseBody = '';
        Composer.find({}, function (err, docs) {
            docs.forEach(function (doc, i) {
                responseBody += ('Composer no. ' + i + '> ' + doc.name + '<br>');
            });
            responseBody += 'listou!';
            response.send(responseBody);
        });
    });

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
