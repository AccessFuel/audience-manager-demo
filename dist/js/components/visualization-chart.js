define(function (require) {
    var $ = require('jquery');

    var Utils = require('utils/global');

    var Defaults = {
        name: 'default',
        type: 'horizontal',
        max: 7
    };

    var _getMaxValue = function(data) {
        return data.map(function(a) {
            return a.pct;
        }).sort(function(a, b) {
            return b - a;
        })[0];
    };

    var _getRelativeSize = function(item, maxValue) {
        return Utils.formatPercent(item.pct / maxValue);
    };

    var _create = function(data, param) {
        var $canvas = $('<div>', {
            class: 'af-chart af--' + param.type + ' af--' + param.name
        });

        // Find max value to draw better scaled graphs
        var maxItems = Math.min(param.max, data.length);
        var maxValue = _getMaxValue(data);

        $.each(data, function(i, item) {
            var itemRealativeSize = _getRelativeSize(item, maxValue);

            // Show only Top 10
            if (i >= maxItems) {
                return false;
            }

            var itemSize = itemRealativeSize + '%';
            var itemWeight = (param.weightAxis ? (item.pct * 100) : (100 / maxItems - 1)) + '%';

            var $bar = $('<div>', {
                class: 'af-chart__bar af--' + Utils.createSlug(item.label),
                style: param.primaryProp + ':' + itemSize + ';'
                     + param.secondaryProp + ':' + itemWeight + ';'
            });

            var $label = $('<label>', {
                class: 'af-chart__label',
                text: item.label,
                title: item.label + ' (' + Utils.formatPercent(item.pct, true) + '%)'
            });

            var $value = $('<output>', {
                class: 'af-chart__value',
                text: Utils.formatPercent(item.pct, true) + '%'
            });

            // Conditional modifiers
            if (param.weightAxis) {
                $bar.addClass('af--weight-axis');
            }

            $bar.addClass('af--weight-' + Math.ceil(itemRealativeSize / 10));

            if (item.label.length > 32) {
                $label.addClass('af--long-text');
            } else if (item.label.length > 24) {
                $label.addClass('af--medium-text');
            }

            $bar
                .append($label)
                .append($value)
                .appendTo($canvas);
        });

        return $canvas;
    };


    var init = function(data, options) {
        if (!data) {
            return false;
        }

        var param = $.extend({}, Defaults, options);
        param.primaryProp = (param.type === 'horizontal') ? 'width' : 'height';
        param.secondaryProp = (param.type === 'horizontal') ? 'height' : 'width';

        return _create(data, param);
    };

    return init;
});