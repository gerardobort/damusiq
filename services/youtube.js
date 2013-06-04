
var mongoose = require('mongoose');

exports.search = function (criteria) {

    var http = require('http'),
        ytApiUrl = 'http://gdata.youtube.com/feeds/api/videos?max-results=8&format=5&alt=json&q=$q',
        ytUrl = ytApiUrl.replace('$q', escape(criteria)),
        promise = new mongoose.Promise();

    http
        .get(ytUrl, function (res) {
            var body = '';
            res.on('data', function (chunk) { body += chunk; });
            res.on('end', function (chunk) {
                var ytJSON = JSON.parse(body);
                    entries = [];
                ytJSON && ytJSON.feed && ytJSON.feed.entry && ytJSON.feed.entry.forEach(function(entry, i) {
                    entries.push({
                        youtube_id: entry.id.$t.replace(/^.*videos\/([^\/]+)$/, '$1'),
                        thumbnail_url: entry.media$group.media$thumbnail[0].url,
                        link_url: entry.link[0].href,
                        title: entry.media$group.media$title.$t
                    });
                });

                promise.complete(entries);
            });
        })
        .on('error', function (error) {
            promise.error(error);
        });

    return promise;
};
