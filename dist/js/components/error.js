define(function (require) {
    var $ = require('jquery');

    var Handlebars = require('handlebars'),
        Navigation = require('components/navigation'),
        Utils = require('utils/global');

    var Template = Handlebars.compile($("#template-error").html());
    var ID = 'js-error';

    var createContainer = function() {
        return $('<section>', {
            'id': ID,
            'class': 'animated fadeIn',
            'data-navigation': 'error',
            'hidden': true,
        }).insertAfter($('.af-main'));
    };

    var init = function(errorData) {
        var $errorContainer = $('#' + ID);

        if (!$errorContainer.length) {
            $errorContainer = createContainer();
        }

        // Log eror
        Utils.renderTemplate($errorContainer, Template, errorData);

        // Bind reload event
        $errorContainer.find('.js-reload').on('click', function() {
            window.location.reload();
        });

        Navigation.navigate('error');
    };

    return init;
});