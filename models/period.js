
/*
 * period model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var PeriodSchema = new Schema({
    _id: ObjectId,
    uri: String,
    name: String
});

PeriodSchema.methods = {
};

mongoose.model('Period', PeriodSchema, 'period');
