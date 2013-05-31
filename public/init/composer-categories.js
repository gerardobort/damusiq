(function ($) {

    createStoryJS({
        type:       'timeline',
        width:      '100%',
        height:     '600',
        source:     '/api/composer-category-timeline/' + $('[data-category-uri]').data('category-uri'),
        embed_id:   'composer-category-timeline',
        font: 'Pacifico-Arimo',
        hash_bookmark: true, 
        js: '/library/custom-timeline-min.js'
    });

}(jQuery));
