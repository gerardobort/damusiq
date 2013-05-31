(function ($) {

    $('#header-search').get(0).focus();

    $('#header-search').on('keyup', function (event) {
        var q = $(this).val();
        if (13 === event.keyCode && q.length) {
            document.location.href = '/search.html?q=' + q;
        }

        var suggestedVal = $('.dropdown-menu > li.active > a').text();
        if (38 === event.keyCode || 40 === event.keyCode && suggestedVal.length) {
            $('#header-search').val(suggestedVal);
        }
    });

    $('#header-search').typeahead({
        ajax: {
            url: '/api/autocomplete',
            timeout: 500,
            displayField: 'endpoint',
            triggerLength: 1,
            method: 'get',
            loadingClass: "loading-circle",
            preDispatch: function (query) {
                return {
                    q: query
                }
            },
            preProcess: function (data) {
                return data.results;
            }
        },
/*
        matcher: function (item) {
            var result = _.find(options, function(r) { return (r.endpoint === item); });
            return ~result.title.toLowerCase().indexOf(this.query.toLowerCase());
        },
        highlighter: function(item) {
            var result = _.find(options, function(r) { return (r.endpoint === item); }),
                html = _.template(
                    '<div><strong><%= result.title %></strong>'
                        + '<span><%= result.description||"" %></span></div>'
                        + (result.picture_url ? '<img src="<%= result.picture_url %>"/>' : ''),
                    { result: result }
                );
            return html;
        },
        updater: function(item) {
            var result = _.find(options, function(r) { return (r.endpoint === item); });
            $searchInput.val(result.title);
            Backbone.history.navigate(result.url, { trigger: true });
        }
*/
    });

}(jQuery));
