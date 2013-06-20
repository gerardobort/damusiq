(function ($) {

    createStoryJS({
        type:       'timeline',
        width:      '100%',
        height:     '500',
        source:     '/api/composer-category-timeline/' + $('[data-category-uri]').data('category-uri'),
        embed_id:   'composer-category-timeline',
        font: 'Pacifico-Arimo',
        hash_bookmark: true, 
        start_at_slide: 1,
        js: '/library/custom-timeline-min.js'
    });

}(jQuery));
