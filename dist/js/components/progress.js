define(function (require) {

    var Utils = require('utils/global');

    var Defaults = {
        time: 20
    }

    var timers = {};

    var $progress;
    var $bar;
    var options;
    var promiseResolve;

    var change = function(progress) {
        var value = Utils.formatPercent(progress);
        $bar.css('width', value + '%');
        //$bar.attr('aria-valuenow', value);
    };

    var complete = function() {
        if (!$progress.hasClass('af--complete')) {
            $progress.addClass('af--complete');
            $progress.siblings('.js-upload-progress__message').prop('hidden', false);
        } else {
            $progress.siblings('.js-upload-progress__message_2').prop('hidden', false);
        }
    }

    var _iterate = function() {
        var progress = Math.max(0, Math.min(1, (Date.now() - options.start) / options.time));
        console.log(progress, Utils.formatPercent(progress));
        change(progress);

        if (progress < 1) {
            timers.iteration = window.setTimeout(function() {
                _iterate();
            }, 100);
        } else {
            if (promiseResolve) {
                // Allow CSS animation to finish
                timers.promise = window.setTimeout(promiseResolve, 500);

                // Show upload takes longer than usual message
                timers.completeMessage1 = window.setTimeout(complete, 5000);

                // Show thanks for patience message
                timers.completeMessage2 = window.setTimeout(complete, 20000);
            }
        }
    };

    var _clearTimers = function() {
        $.each(timers, function(_, timer) {
            window.clearTimeout(timer);
        });
    };

    var init = function($element, param, resolve) {
        _clearTimers();

        $progress = $element;
        $bar = $progress.find('.js-progress-bar');

        options = $.extend({}, Defaults, param);
        options.start = Date.now();
        options.time = options.time * 1000;

        if (resolve) {
            promiseResolve = resolve;
        }

        // Reset
        change(0);

        // Start timer
        _iterate();
    };

    return {
        init: init,
        change: change
    };
});