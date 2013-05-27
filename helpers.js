
/*
 * helpers.
 */

exports.url = function(options) {
    if (options.categoryUri) {
        return '/composers/' + options.categoryUri + '.html';
    }
    if (options.composerUri && options.opusUri && options.scoreUri) {
        return '/' + options.composerUri + '/' + options.opusUri + '/' + options.scoreUri + '.html';
    }
    if (options.composerUri && options.opusUri) {
        return '/' + options.composerUri + '/' + options.opusUri + '.html';
    }
    if (options.composerUri) {
        return '/' + options.composerUri + '.html';
    }
    console.log('Unbale to create URL:', options);
    return '/';
};
