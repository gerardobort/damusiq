(function ($) {

    createStoryJS({
        type:       'timeline',
        width:      '960',
        height:     '600',
        source:     '/api/composer-category-timeline/' + $('[data-category-uri]').data('category-uri'),
        embed_id:   'composer-category-timeline'
    });

}(jQuery));
