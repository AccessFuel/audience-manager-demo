var Utils = (function($, window) {
    var Utils = function() {};

    Utils.pct = function(value) {
        if (value > 0 && value <= 1) {
            return Math.round(value * 100);
        } else {
            return Math.round(value);
        }
    };

    Utils.createSlug = function(string) {
        if (typeof string !== 'string') {
            return '';
        }

        return string
            .toLowerCase()
            .replace(/[^\w\d]+/g,'-')
            .replace(/^-+|-+$/g, '');
    };

    Utils.formatNumber = function(number) {
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

    Utils.formatDataByType = function(data, type) {
        switch (type) {
            case 'share':
                return Utils.formatNumber(data[0]) + '<sub>/' + Utils.formatNumber(data[1]) + '</sub>';
            default:
                return Utils.formatNumber(data[0]);
        }
    }

    return Utils;
})(jQuery, window);
