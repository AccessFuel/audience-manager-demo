define(function (require) {
    var $ = require('jquery');

    var Utils = require('utils/global');


    var BaseFontSize = 64;
    var MinFontSize = 6;
    var MaxFontSize = 64;
    var LowFontSize = 30;
    var HighFontSize = 55;

    var Defaults = {
        list: [],
        color: 'random-dark',
        fontFamily: 'Helvetica',
        rotateRatio: .2,
        weightFactor: 1.5,
        gridSize: 10,
        ellipticity: .5,
        colorScheme: 'default'
    };

    var _setColorScheme = function(colorScheme) {
        var colors = {
            default: '#4dbc72', // Brand green
            low: '#c4e4c5', // Light brand green
            high: 'red'
        }

        switch (colorScheme) {
            default: break;
            case 'Gray':
                colors.low = '#bbb';
                colors.default = '#666';
                break;
        }

        return function (word, weight) {
            if (weight < LowFontSize) {
                return colors.low;
            } else if (weight > HighFontSize) {
                return colors.high;
            } else {
                return colors.default;
            }
        };
    };

    // Dynamically set Wordcloud font size thresholds
    var _setFontSizeTreshold = function(item) {
        if (!item.label || !item.label.length) {
            return;
        }

        // Dynamic font size (based on the largest item label text length)
        MaxFontSize = Math.round(Math.max(14, BaseFontSize - Math.pow(item.label.length / 5, 2)));
        LowFontSize = MaxFontSize / 2;
        HighFontSize = 3 * MaxFontSize / 4;

        console.log('WordCLoud Setup', MaxFontSize, LowFontSize, HighFontSize);
    };

    // Parse JSON data to a format that WordCloud would accept
    // ([word, weight])
    var _getMaxValue = function(data) {
        var maxValue = 1;

        $.each(data, function(_, item) {
            if (item.value > maxValue) {
                maxValue = item.value;

                _setFontSizeTreshold(item);
            }
        });

        return maxValue;
    };

    var _getRelativeSize = function(item, maxValue) {
        return Utils.range(item.value / maxValue * MaxFontSize, MinFontSize, MaxFontSize);
    }

    var _sortData = function(x,y) {
        var index = 1;
        return (x[index] === y[index]) ? 0 : (x[index] > y[index] ? -1 : 1);
    };

    var _parseData = function(data) {
        var maxValue = _getMaxValue(data);

        var parsedData = data.map(function(item) {
            var label = item.label;
            var value = _getRelativeSize(item, maxValue);

            return [label, value];
        });

        // Sort Data by weight so that the most important words
        // were not lost due to the lack of space
        return parsedData.sort(_sortData);
    };


    var _create = function(param) {
        var $canvas = $('<div>', {
            class: 'af-wordcloud',
            width: 640,
            height: 360
        });

        // Init Wordcloud plugin
        requirejs(['wordcloud'], function(wordcloud) {
            wordcloud($canvas.get(0), param);
        });


        return $canvas;
    };


    var init = function(data, options) {
        if (!data) {
            return false;
        }

        var param = $.extend({}, Defaults, options);
        param.list = _parseData(data);
        param.color = _setColorScheme(param.colorScheme);

        return _create(param);
    };

    return init;
});