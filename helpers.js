
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

String.prototype.sanitize = function () {
    var str = this.replace(/<[^>]*?>/g, '');
    return str;
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,"");
}

String.prototype.ucWords = function () {
    return this.split(' ').map(function (w) {
        return w.substr(0, 1).toUpperCase() + w.substr(1); 
    }).join(' ');
}

String.prototype.parseUrl = function () {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
        return '<a href="' + url + '" target="_blank" rel="nofollow">' + url + '</a>';
    });
};

exports.url = function(options) {
    if (options.instrumentUri) {
        return '/instruments/' + options.instrumentUri + '.html';
    }
    if (options.periodUri) {
        return '/periods/' + options.periodUri + '.html';
    }
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
