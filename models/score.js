
/*
 * score model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ScoreSchema = new Schema({
    _id: ObjectId,
    uri: String,
    name: String,
    composer: { type: ObjectId, ref: 'Composer'},
    opus: { type: ObjectId, ref: 'Opus'},
    instruments: [
        { type: ObjectId, ref: 'Instrument'}
    ]
});

ScoreSchema.methods = {
};

mongoose.model('Score', ScoreSchema, 'score');
