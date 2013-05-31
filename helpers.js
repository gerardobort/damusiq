
/*
 * helpers.
 */

String.prototype.crop = function (max, ellypsis) {
    var str = this.replace(/<[^>]*?>/g, '');
    if (str.length > max) {
        return str.substr(0, max) + (ellypsis || '...');
    }
    return str;
};

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
