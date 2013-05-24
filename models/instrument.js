
/*
 * score model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var InstrumentSchema = new Schema({
    _id: ObjectId,
    uri: String,
    name: String,
});

InstrumentSchema.methods = {
};

mongoose.model('Instrument', InstrumentSchema, 'instrument');
