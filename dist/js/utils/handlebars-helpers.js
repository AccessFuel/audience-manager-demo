define(function (require) {
    var Handlebars = require('handlebarsCore'),
        Moment = require('moment');

    Handlebars.registerHelper('if_eq', function(a, b, opts) {
        if(a == b) // Or === depending on your needs
            return opts.fn(this);
        else
            return opts.inverse(this);
    });

    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });

    Handlebars.registerHelper('formatDate', function(date) {
        // 2016/01/12, 3:48 pm
        return Moment(date).format('YYYY/MM/DD, h:mm a');
    });

    Handlebars.registerHelper('formatNumber', function(number) {
        // 1345 -> 1.3k

        if (typeof(number) === 'string' || number < 1000) {
            return number;
        } else if (number < 1000000) {
            return Math.round( number / 100 ) / 10 + 'k';
        } else if (number < 1000000000) {
            return Math.round( number / 100000 ) / 10 + 'M';
        } else {
            return Math.round( number / 100000000 ) / 10 + 'B';
        }
    });

    Handlebars.registerHelper('formatPercent', function(number) {
        var percentValue = Math.max(0, Math.min(1, number)) * 100;
        return Math.round(percentValue) + '%';
    });

    Handlebars.registerHelper('pluralize', function(label, value, enable) {
        // User -> Users
        return label + ((enable && value !== 1) ? 's' : '');
    });

    Handlebars.registerHelper('qualityClass', function(quality) {
        if (quality < 0.33) {
            return 'af--low';
        } else if (quality < 0.66) {
            return 'af--medium';
        } else if (quality <= 1) {
            return 'af--high';
        } else {
            return false;
        }
    });

    return Handlebars;

});
