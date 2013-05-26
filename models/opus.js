
/*
 * composer category model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var OpusSchema = new Schema({
    _id: ObjectId,
    uri: String,
    name: String,
    composer: { type: ObjectId, ref: 'Composer'},
    scores: [
        { type: ObjectId, ref: 'Score'}
    ],
    periods: [
        { type: ObjectId, ref: 'Period'}
    ]
});

OpusSchema.methods = {
};

mongoose.model('Opus', OpusSchema, 'opus');
