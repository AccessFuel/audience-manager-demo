define(function (require) {
    var $ = require('jquery');

    var Utils = require('utils/global');

    var Defaults = {
        type: 'column'
    };

    var _parseData = function(data) {
        // Parse JSON data to a format that Highchart would accept
        // ({name, value})
        return data.map(function(item) {
            return {
                name: item.label,
                value: Utils.formatPercent(item.pct, true)
            };
        });
    };


    var _create = function(data, param) {
        var $canvas = $('<div>', {
            class: 'af-map'
        });

        requirejs(['highMapUS'], function() {
            $canvas.highcharts('Map', {
                title : { text : null },
                legend: { enabled: false },
                credits: { enabled: false },

                mapNavigation: {
                    enabled: false
                },

                chart: {
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0,
                    spacingTop: 0
                },

                colorAxis: {
                    min: 1,
                    minColor: '#ddefde',
                    maxColor: '#81c684',
                    tickColor: '#2c9e52',
                    type: 'logarithmic',
                },

                series : [{
                    name: 'Audience from',
                    data : data,
                    joinBy: 'name',
                    mapData: Highcharts.maps['countries/us/us-all'],

                    borderColor: '#cccccc',
                    nullColor: '#fefefe',

                    states: {
                        hover: {
                            color: '#2c9e52'
                        }
                    },

                    dataLabels: {
                        enabled: true,
                        color: '#2f4050',
                        formatter: function() {
                            if (this.point.value && this.point.value > 0) {
                                return this.point.properties['hc-a2']
                                     + '<br/>'
                                     + '<small>' + this.point.value + '%</small>';
                            } else {
                                return '';
                            }
                        },
                        style: 'text-shadow: none; font-weight: 100;',
                        useHTML: false
                    },
                    tooltip: {
                        pointFormat: '{point.value}% attendees from {point.name}'
                    }
                }]
            });
        });

        return $canvas;
    };


    var init = function(data, options) {
        if (!data) {
            return false;
        }

        var param = $.extend({}, Defaults, options);
        var reportData = _parseData(data)

        return _create(reportData, param);
    };

    return init;
});