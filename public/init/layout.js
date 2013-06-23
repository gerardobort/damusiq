(function ($) {

    $('#header-search').get(0).focus();

    // when hitting the keyboard
    $('#header-search').on('keyup', function (event) {
        var q = $(this).val();
        if ((13 === event.keyCode || event.keyCode < 5) && q.length) {
            document.location.href = '/search.html?q=' + q;
        }

        var suggestedVal = $('.dropdown-menu > li.active > a').text();
        if (38 === event.keyCode || 40 === event.keyCode && suggestedVal.length) {
            $('#header-search').val(suggestedVal);
        }
    });

    // when clicking on the dropdown menu
    $('#header-search').on('change', function (event) {
        var q = $(this).val();
        if ($('.typeahead.dropdown-menu li.active').text() === q) {
            document.location.href = '/search.html?q=' + q;
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
        }
    });


    // Facebook ------------
    window.fbAsyncInit = function() {
        // init the FB JS SDK
        FB.init({
          appId      : '599612076723689',                        // App ID from the app dashboard
          channelUrl : '/channel.html',                      // Channel file for x-domain comms
          status     : true,                                 // Check Facebook Login status
          xfbml      : true                                  // Look for social plugins on the page
        });
        // Additional initialization code such as adding Event Listeners goes here
    };

    // Load the SDK asynchronously
    (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/all.js";
         fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // ------------ Facebook

}(window.jQuery));
