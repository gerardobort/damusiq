
/*
 * score model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Composer = require(__dirname + '/composer'),
    Opus = require(__dirname + '/opus'),
    Period = require(__dirname + '/period'),
    Instrument = require(__dirname + '/instrument');

var ScoreSchema = new Schema({
    _id: ObjectId,
    uri: String,
    name: String,
    composer: { type: ObjectId, ref: 'Composer'},
    opus: { type: ObjectId, ref: 'Opus'},
    periods: [
        { type: ObjectId, ref: 'Period'}
    ],
    instruments: [
        { type: ObjectId, ref: 'Instrument'}
    ]
});

ScoreSchema.methods = {
    getUri: function () {
console.log(this.get('composer'))
console.log(this.get('opus'))
        return '/' + this.get('composer.uri') 
            + '/' + this.get('opus.uri') 
            + '/' + this.get('uri');
    }
};

mongoose.model('Score', ScoreSchema, 'score');
