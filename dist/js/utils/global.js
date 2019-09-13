define(function (require) {
    var $ = require('jquery');

    // Calculate average value of keys in objects array
    var averageQuality = function(array, key) {
        var totalValue = 0;
        $.each(array, function(_, item) {
            if (item[key]) {
                totalValue += item[key];
            }
        });

        return totalValue / array.length;
    };

    var createSlug = function(string) {
        if (typeof string !== 'string') {
            return '';
        }

        return string
            .toLowerCase()
            .replace(/[^\w\d]+/g,'-')
            .replace(/^-+|-+$/g, '');
    };

    var normalizePercentNumber = function(number) {
        return Math.max(0, Math.min(1, number)) * 100;
    };

    // Fromat numers
    // e.g. 14324 -> 14k
    var formatNumber = function(number) {
        if (typeof(number) === 'string' || number < 1000) {
            return number;
        } else if (number < 1000000) {
            return Math.round( number / 100 ) / 10 + 'k';
        } else if (number < 1000000000) {
            return Math.round( number / 100000 ) / 10 + 'M';
        } else {
            return Math.round( number / 100000000 ) / 10 + 'B';
        }
    };

    var formatPercent = function(number, round) {
        var percentValue = normalizePercentNumber(number);
        return round ? Math.round(percentValue) : percentValue;
    };

    // Returns string: 'low', 'med' or 'hi'
    var getQualityClass = function(value, reverse) {
        var percentValue = normalizePercentNumber(value);

        if (percentValue < 30) {
            return reverse ? 'hi' : 'low';
        } else if (percentValue >= 75) {
            return reverse ? 'low' : 'hi';
        } else {
            return 'med';
        }
    };

    var getTotalValueShare = function(value, total, ignoreModifier) {
        var shareValue = total ? value/total : value;
        return {
            value: formatPercent(shareValue, true) + '%',
            modifier: !ignoreModifier ? 'af--share-' + getQualityClass(shareValue) : ''
        }
    };

    var range = function(data, min, max) {
        if (!data) {
            data = 0;
        }

        data = min ? Math.max(min, data) : data;
        data = max ? Math.min(max, data) : data;
        return data;
    };

    var renderTemplate = function($container, template, data) {
        $container.empty().html(template(data));
    };

    return {
        averageQuality: averageQuality,
        createSlug: createSlug,
        formatNumber: formatNumber,
        formatPercent: formatPercent,
        getQualityClass: getQualityClass,
        getTotalValueShare: getTotalValueShare,
        range: range,
        renderTemplate: renderTemplate
    }
});
