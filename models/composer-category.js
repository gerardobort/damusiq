
/*
 * composer category model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ComposerCategorySchema = new Schema({
    _id: ObjectId,
    uri: String,
    name: String
});

ComposerCategorySchema.methods = {
};

mongoose.model('ComposerCategory', ComposerCategorySchema, 'composerCategory');
