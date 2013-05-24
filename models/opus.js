
/*
 * composer category model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Composer = require(__dirname + '/composer'),
    Score = require(__dirname + '/score');

var OpusSchema = new Schema({
    _id: ObjectId,
    uri: String,
    name: String,
    composer: [
        { type: ObjectId, ref: 'Composer'}
    ],
    scores: [
        { type: ObjectId, ref: 'Score'}
    ]
});

OpusSchema.methods = {
};

mongoose.model('Opus', OpusSchema, 'opus');
