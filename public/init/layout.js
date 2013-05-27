(function ($) {

    $('#header-search').on('keyup', function (event) {
        var q = $('[name="q"]', this).val();
        if (13 === event.keyCode && q.length) {
            document.location.href = '/search.html?q=' + q;
        }
    });

}(jQuery));
