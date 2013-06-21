
/*
 * composer category model
 */

var mongoose = require('mongoose'),
    mongooseTextSearch = require('mongoose-text-search'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ComposerCategorySchema = new Schema({
    _id: ObjectId,
    uri: String,
    name: String
});

ComposerCategorySchema.methods = {
};

ComposerCategorySchema.plugin(mongooseTextSearch);

mongoose.model('ComposerCategory', ComposerCategorySchema, 'composerCategory');
