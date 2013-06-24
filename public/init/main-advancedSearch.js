(function ($) {


    function refreshPanels () {
        $('.advanced-search-panel').toggleClass('active', false);
        $('.advanced-search-panel.' + $('[name="search_for"]:checked').val()).toggleClass('active', true);
    }

    $('[name="search_for"]').closest('label').on('click', refreshPanels);
    refreshPanels();

    $('#search a').on('click', function (e) {
        e.preventDefault();
        $('.advanced-search-panel.active form').get(0).submit();
    });

}(jQuery));
