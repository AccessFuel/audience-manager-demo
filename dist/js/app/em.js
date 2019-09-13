define(function (require) {
    var $ = require('jquery');

    // Template scripts
    require('global');
    require('knob');

    // Libraries
    // ---------
    var Sort = require('components/sort'),
        Utils = require('utils/global');

    var initEvents = function() {
        var $events = $('.js-events-widget');
        var showEvents = function(target) {
            var $target = $(target);
            if (!target || !$target.length) {
                return;
            }

            $events.prop('hidden', true);

            var $targetContent = $target.find('.js-events-widget-content');
            var $targetLoader = $target.find('.js-events-widget-loader');

            $targetLoader.prop('hidden', false);
            $targetContent.prop('hidden', true);
            $target.prop('hidden', false);

            // Fake slowliness
            setTimeout(function() {
                $targetLoader.prop('hidden', true);
                $targetContent.prop('hidden', false);
            }, $targetContent.find('.js-event-item').length * 50);
        };

        var $toggles = $('.js-events-toggle');
        $toggles.on('click', function() {
            var $toggle = $(this);
            var target = $toggle.data('target');
            showEvents(target);

            $toggles.removeClass('af--active');
            $toggle.addClass('af--active');
        });

        $toggles.filter('.af--active').trigger('click');
    };

    var initEventModal = function() {
        var $modal = $('.js-event-modal');
        var $toggles = $('.js-event-item');

        var $container = $modal.find('.js-event-modal-content');
        var $error = $modal.find('.js-event-modal-error');
        var $loader = $modal.find('.js-event-modal-loader');


        $toggles.on('click', function() {
            var $toggle = $(this);
            var contentURL = $toggle.data('content');

            $container.empty().prop('hidden', true);
            $error.prop('hidden', true);
            $loader.prop('hidden', false);

            $container.load(contentURL, function(response, status, xhr) {
                if (status === "error") {
                    $loader.prop('hidden', true);
                    $error.prop('hidden', false);
                    return;
                }

                initKnobChart($container);

                window.setTimeout(function() {
                    $loader.prop('hidden', true);
                    $container.prop('hidden', false);
                    animateKnobChart($container);
                }, 1500);
            });
        });
    };

    var initKnobChart = function($context) {
        $context.find('.js-knob-container').each(function(_, container) {
            var $container = $(container);
            var $knobInput = $container.find('input.knob');
            var color = '#666666';

            if ($container.hasClass('af--hi')) {
                color = '#4dbc72';
            } else if ($container.hasClass('af--med')) {
                color = '#f0ad4e';
            } else if ($container.hasClass('af--low')) {
                color = '#ed5565';
            }

            $('.knob').knob({
                fgColor: color,
                readOnly: true,
                thickness: .1,
                height: 100,
                width: 100,
                displayInput: false,
                lineCap: 'round',
                step: 0.1
            });
        });
    };

    var animateKnobChart = function($context) {
        $context.find('input.knob').each(function(_, knobInput) {
            var $knobInput = $(knobInput);
            var knobInputValue = parseInt($knobInput.data('value'));
            var animationValue = 0;
            var animationStep = knobInputValue / 50;

            var _animateKnobChart = function() {
                if (animationValue >= knobInputValue) {
                    return;
                }
                animationValue += animationStep;
                $knobInput.val(animationValue).trigger('change');
                setTimeout(_animateKnobChart, 16);
            };

            $knobInput.val(animationValue).trigger('change');
            setTimeout(_animateKnobChart, 200);
        });


    };

    var initSort = function() {
        Sort($('.js-sort'));
    };

    var init = function() {
        initEvents();
        initEventModal();
        //initCharts();
        initSort();
    };

    return init;
});