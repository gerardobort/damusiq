
/*
 * handle category pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.main = function(req, res) {
    res.setHeader('Content-Type', 'text/xml');
    res.render('sitemap.xml', {
        baseUrl: 'http://damusiq.com',
        now: new Date(),
        layout: null
    });
};

exports.categories = function(req, res) {
    mongoose.model('ComposerCategory')
        .find({ lang: req.lang }, 'uri count updated')
        .sort({ count: -1 })
        .exec(function (err, categories) {
            res.setHeader('Content-Type', 'text/xml');
            res.render('sitemap-categories.xml', {
                categories: categories,
                baseUrl: 'http://damusiq.com',
                layout: null
            });
        });
};

exports.periods = function(req, res) {
    mongoose.model('Period')
        .find({ }, 'uri updated')
        .sort({ count: -1 })
        .exec(function (err, periods) {
            res.setHeader('Content-Type', 'text/xml');
            res.render('sitemap-periods.xml', {
                periods: periods,
                baseUrl: 'http://damusiq.com',
                layout: null
            });
        });
};

exports.composers = function(req, res) {
    mongoose.model('Composer')
        .find({ }, 'uri updated')
        .sort({ count: -1 })
        .exec(function (err, composers) {
            res.setHeader('Content-Type', 'text/xml');
            res.render('sitemap-composers.xml', {
                composers: composers,
                baseUrl: 'http://damusiq.com',
                layout: null
            });
        });
};

exports.instruments = function(req, res) {
    mongoose.model('Instrument')
        .find({ }, 'uri updated')
        .sort({ count: -1 })
        .exec(function (err, instruments) {
            res.setHeader('Content-Type', 'text/xml');
            res.render('sitemap-instruments.xml', {
                instruments: instruments,
                baseUrl: 'http://damusiq.com',
                layout: null
            });
        });
};
