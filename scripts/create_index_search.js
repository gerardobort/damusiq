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
)

