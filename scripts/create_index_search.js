// remove all composer text indexes
db.composer.getIndexes().forEach(function (index) {
    if (index.key._fts && 'text' === index.key._fts) {
        db.composer.dropIndex(index.name);
    }
});
// create composer text indexes
db.composer.createIndex(
    {
        'fullname': 'text',
        'wiki.en': 'text',
        'wiki.es': 'text',
        'wiki.it': 'text'
    },
    {
        weights: {
            'fullname': 10,
            'wiki.en': 5,
            'wiki.es': 5,
            'wiki.it': 5
        },
        name: 'text-index'
    }
);

// remove all composerCategory text indexes
db.composerCategory.getIndexes().forEach(function (index) {
    if (index.key._fts && 'text' === index.key._fts) {
        db.composerCategory.dropIndex(index.name);
    }
});
// create composerCategory text indexes
db.composerCategory.createIndex(
    {
        'name': 'text'
    },
    {
        weights: {
            'name': 15
        },
        name: 'text-index'
    }
);
