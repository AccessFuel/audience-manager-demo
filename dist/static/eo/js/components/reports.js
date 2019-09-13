var ReportsUI = (function($, window) {
    var Reports = function() {
        this.init();
    };

    Reports.prototype.init = function() {
        this.knownReports = [
            'gender',
            'age',
            'state',
            'industry',
            'company'
        ];
    };

    Reports.prototype.createReports = function(reportsSequence, $container, reportsData, createEmpty) {
        if (!reportsSequence.length || !$container.length || !reportsData) {
            return false;
        }

        $container.empty();

        $.each(reportsSequence, $.proxy(function(_, reportName) {
            this.create(reportName, $container, reportsData[reportName], createEmpty);
        }, this));

        // Place all empty reports in the end
        if (createEmpty) {
            $container.find('.af-report.af--empty').appendTo($container);
        }
    };

    Reports.prototype.create = function(reportName, $container, reportData, createEmpty) {
        if (!$container.length || (!reportData && !createEmpty)) { return false; }

        // Create empty/promo report block
        if (!reportData && createEmpty) {
            return this._createEmptyReportCard($container, reportName);
        }

        var $reportCard = this._createReportCard($container, reportData);

        switch (reportName) {
            default:
                console.log(reportName, 'Report is not supported');
                return false;
            case 'gender':
                this.genderReport($reportCard, reportData);
                break;
            case 'age':
                this.ageReport($reportCard, reportData);
                break
            case 'state':
                this.stateReport($reportCard, reportData);
                break;
            case 'city':
                this.cityReport($reportCard, reportData);
                break;
            case 'zip_code':
                this.zipReport($reportCard, reportData);
                break;
            case 'education':
                this.educationReport($reportCard, reportData);
                break;
            case 'industry':
                this.industryReport($reportCard, reportData);
                break;
            case 'company':
                this.companyReport($reportCard, reportData);
                break;
            case 'job_title':
            case 'jobs':
                this.jobsReport($reportCard, reportData);
                break;
            case 'skills':
            case 'skills_name':
            case 'skills__name':
                this.skillsReport($reportCard, reportData);
                break;
            case 'employment_domain':
                this.companyReport($reportCard, reportData);
                break;
            case 'twitter':
            case 'twitter_followers':
                this.twitterReport($reportCard, reportData);
                break

        }
    };

    Reports.prototype.genderReport = function ($reportCard, reportData) {
        var data = this._parseGenderData(reportData, ['male', 'female']);

        this._customChartReport($reportCard, data, {
            type: 'vertical',
            name: 'gender',
            max: 2
        });
    };

    Reports.prototype.ageReport = function ($reportCard, reportData) {
        this._customChartReport($reportCard, reportData.data, {
            type: 'vertical',
            name: 'age',
            weightAxis: true,
            max: 10
        });
    };

    Reports.prototype.stateReport = function ($reportCard, reportData) {
        this._mapReport($reportCard, reportData);
    };

    Reports.prototype.cityReport = function ($reportCard, reportData) {
        // TODO:
        // 1. API should return data sorted by value
        // 2. API should combine States data with Cities to perform a drill on a single chart/map
        this._customChartReport($reportCard, reportData.data, {
            type: 'horizontal',
            name: 'cities'
        });
    };

    Reports.prototype.zipReport = function ($reportCard, reportData) {
        // TODO:
        // 1. API should return data sorted by value
        // 2. API should combine States data with Cities to perform a drill on a single chart/map
        this._googleMapReport($reportCard, reportData, {});
    };

    Reports.prototype.industryReport = function ($reportCard, reportData) {
        this._customChartReport($reportCard, reportData.data, {
            type: 'horizontal',
            name: 'jobs'
        });
    };

    Reports.prototype.jobsReport = function ($reportCard, reportData) {
        this._customChartReport($reportCard, reportData.data, {
            type: 'horizontal',
            name: 'jobs'
        });
    };


    Reports.prototype.companyReport = function($reportCard, reportData) {
        var options = {
            fontFamily: 'Futura',
        };
        this._wordCloudReport($reportCard, reportData, options);
    };

    Reports.prototype.educationReport = function($reportCard, reportData) {
        var options = {
            fontFamily: 'Times New Roman',
        };
        this._wordCloudReport($reportCard, reportData, options);
    };

    Reports.prototype.skillsReport = function($reportCard, reportData) {
        var options = {
            fontFamily: 'Impact'
        };
        this._wordCloudReport($reportCard, reportData, options);
    };


    Reports.prototype.twitterReport = function ($reportCard, reportData) {
        this._customChartReport($reportCard, reportData.data, {
            type: 'vertical',
            name: 'twitter',
            max: 10
        });
    };


    // Report Controllers
    // ==================

    Reports.prototype._customChartReport = function($reportCard, data, options) {
        var defaults = {
            name: 'default',
            type: 'horizontal',
            max: 5
        };

        var param = $.extend({}, defaults, options);
        var $canvas = $reportCard.data('report');

        if (!data || !$canvas.length) {
            return false;
        }

        // Find max value to draw better scaled graphs
        var maxItems = Math.min(param.max, data.length);
        var maxValue = data.map(function(a) {
            return a.pct;
        }).sort(function(a, b) { return b - a })[0];

        var _relativeSize = function(item) {
            return Utils.pct(item.pct / maxValue);
        }

        param.primaryProp = (param.type === 'horizontal') ? 'width' : 'height';
        param.secondaryProp = (param.type === 'horizontal') ? 'height' : 'width';

        $canvas.addClass('af-chart af--' + param.type + ' af--' + param.name);

        $.each(data, function(i, item) {
            var itemRealativeSize = _relativeSize(item);

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
                title: item.label + ' (' + Utils.pct(item.pct) + '%)'
            });

            var $value = $('<output>', {
                class: 'af-chart__value',
                text: Utils.pct(item.pct) + '%'
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
    };



    Reports.prototype._donutReport = function($reportCard, reportData, options) {
        var data = this._parseMorrisData(reportData, options);

        var $canvas = $reportCard.data('report');

        if (!data || !$canvas.length) {
            return false;
        }

        $canvas.addClass('af--donut');
        this._initMorrisPlugin($canvas, data, options);
    };

    Reports.prototype._chartReport = function($reportCard, reportData, options) {
        var data = this._parseHighchartData(reportData, options);
        var $canvas = $reportCard.data('report');

        if (!data || !$canvas.length) {
            return false;
        }

        $canvas.addClass('af--chart');
        this._initHighchartPlugin($canvas, data, options);
    };

    Reports.prototype._googleMapReport = function($reportCard, reportData) {
        var data = reportData.data.splice(0, 10);
        var $canvas = $reportCard.data('report');

        if (!data || !$canvas.length) {
            return false;
        }

        var _getCache = function(key) {
            var cache = window.localStorage.getItem(key);
            return cache ? JSON.parse(cache) : {};
        };

        var _getLangLong = function(item, callback) {
            // Normalize ZIP-code
            var zip = parseInt(item.label).toString();

            // Use local storage as acache
            if (zipCache[zip]) {
                callback(item, zipCache[zip]);
                console.log('Loaded ZIP-code coordinates from local storage', zip, zipCache[zip]);
            } else {
                geocoder.geocode( { 'address': zip}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var position = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        };

                        zipCache[zip] = position;

                        window.localStorage.setItem('zipCache', JSON.stringify(zipCache));

                        console.log('Loaded ZIP-code coordinates from google API', zip, position);
                        callback(item, position);
                    } else {
                        alert("Geocode was not successful for the following reason: " + status);
                    }
                });
            }
        }

        var _drawCirle = function(map, item, position) {
            var zipCircle = new google.maps.Circle({
                strokeColor: '#81c684',
                strokeOpacity: 1,
                strokeWeight: 1,
                fillColor: '#81c684',
                fillOpacity: 0.75,
                map: map,
                center: position,
                radius: Math.sqrt(item.pct) * 3000
            });
        }

        var _initMap = function() {
            var map = new google.maps.Map($canvas.get(0), {
                center: data[0].position,
                streetViewControl: false,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                zoom: 12,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_TOP
                }
            });

            $.each(data, function(i, item) {
                // Add the circle for this city to the map.
                _getLangLong(item, function(item, position) {
                    _drawCirle(map, item, position);

                    // Center map
                    if (i === 0) {
                        var center = new google.maps.LatLng(position.lat, position.lng);
                        map.panTo(center);
                    }
                });

            });
        };

        var geocoder = new google.maps.Geocoder();
        var zipCache = _getCache('zipCache');
        console.log(zipCache);

        if (data.length) {
            _initMap();
        }
    };


    Reports.prototype._mapReport = function($reportCard, reportData) {
        var data = this._parseHighmapData(reportData);
        var $canvas = $reportCard.data('report');

        if (!data || !$canvas.length) {
            return false;
        }

        $canvas.addClass('af--map');
        this._initHighmapPlugin($canvas, data);
    };

    Reports.prototype._wordCloudReport = function($reportCard, reportData, options) {
        var data = this._parseWordCloudData(reportData);
        var $canvas = $reportCard.data('report');

        if (!data || !$canvas.length) {
            return false;
        }

        $canvas.addClass('af--wordcloud');
        this._initWordCloudPlugin($canvas, data, options);
    }

    // Report Parsers
    // ==============

    Reports.prototype._parseGenderData = function(reportData, dataSequence) {
        // TODO: API returns unfiltered data, filter only male and female
        // ({label, value})

        var parseJSON = function(id) {
            return reportData.data.filter(function(data) {
                return data.label === id;
            })[0];
        };

        var data = dataSequence.map(parseJSON);
        return data;
    };

    Reports.prototype._parseHighchartData = function(reportData, options) {
        // Parse JSON data to a format that Highchart would accept
        // ({name, y})
        var data = reportData.data.map(function(item) {
            return {name: item.label, y: Utils.pct(item.pct)};
        });

        if (options.sort) {
            data = data.sort(function(x,y) {
                var index = 1;
                return (x[index] === y[index]) ? 0 : (x[index] > y[index] ? -1 : 1);
            });
        }

        return data;
    };

    Reports.prototype._parseHighmapData = function(reportData, options) {
        // Parse JSON data to a format that Highchart would accept
        // ({name, value})
        var data = reportData.data.map(function(item) {
            return {name: item.label, value: Utils.pct(item.pct)};
        });

        return data;
    };

    Reports.prototype._parseMorrisData = function(reportData, options) {
        // Parse JSON data to a format that Highchart would accept
        // ({name, value})
        var data = reportData.data.map(function(item) {
            return {label: item.label, value: Utils.pct(item.pct)};
        });

        return data;
    };

    Reports.prototype._parseWordCloudData = function(reportData) {
        var maxSkillValue = 1;

        $.each(reportData.data, function(_, item) {
            if (item.value > maxSkillValue) {
                maxSkillValue = item.value;
            }
        });

        // Parse JSON data to a format that WordCloud would accept
        // ([word, weight])
        var parseJSON = function(item) {
            var label = item.label;
            var value = item.value / maxSkillValue * 60;

            // Normalize value
            value = this._range(value, 5, 60)

            return [label, value];
        };

        var data = reportData.data.map($.proxy(parseJSON, this));

        // Sort Data by weight so that most important words
        // were not lost due to the lack of speed
        return data.sort(function(x,y) {
            var index = 1;
            return (x[index] === y[index]) ? 0 : (x[index] > y[index] ? -1 : 1);
        });
    };


    Reports.prototype._range = function(data, min, max) {
        if (!data) {
            data = 0;
        }

        data = min ? Math.max(min, data) : data;
        data = max ? Math.min(max, data) : data;
        return data;
    };

    // Report Renderers
    // ================
    Reports.prototype._createReportCard = function($container, data) {
        var $reportCard = $('<figure>', {
            class: 'af-report af--' + data.summary.id
        });

        var $header = $('<figcaption>', {
            class: 'af-report__caption'
        });

        var $title = $('<h3>', {
            class: 'af-report__title',
            text: data.summary.title
        });

        var $quality = $('<span>', {
            class: 'af-report__quality',
            html: Utils.pct(data.summary.quality_pct) + '%'
        });

        var $description = $('<p>', {
            class: 'af-report__description',
            html: data.summary.description
        });

        var $report = $('<div>', {
            class: 'af-report__canvas'
        });

        // Quality conditional styling
        if (data.summary.quality_pct < 0.33) {
            $quality.addClass('af--low');
        } else if (data.summary.quality_pct < 0.66) {
            $quality.addClass('af--medium');
        } else {
            $quality.addClass('af--high');
        }

        $title.append($quality);
        $header.append($title).append($description);

        $reportCard
            .append($header)
            .append($report)
            .data('report', $report)
            .appendTo($container);

        return $reportCard;
    };

    Reports.prototype._createEmptyReportCard = function($container, reportID) {
        if ($.inArray(reportID, this.knownReports) < 0) {
            return;
        }

        var $reportCard = $('<section>', {
            class: 'af-report af--empty'
        });

        var $content = $('<div>', {
            class: 'af-report__content'
        });

        var $title = $('<h3>', {
            class: 'af-report__title',
            text: reportID
        });

        var $cta = $('<a>', {
            href: '/request-enhance',
            class: 'btn btn-primary btn-sm af-button',
            html: '<i class="fa fa-unlock"></i> Unlock ' + reportID + ' insights',
            'data-toggle': 'modal',
            'data-target': '#requestEnhanceModal'
        });


        var $sample = $('<img>', {
            src: '/dist/af_img/reports/sample-report-' + reportID + '@2x.jpg',
            class: 'af-report__sample',
            alt: reportID + ' sample report'
        });

        $content
            .append($title)
            .append($cta);

        $reportCard
            .append($sample)
            .append($content)
            .appendTo($container);

        return $reportCard;
    };

    Reports.prototype._initHighchartPlugin = function($canvas, data, options) {
        var defaults = {
            type: 'column'
        };

        console.log(data);

        var param = $.extend({}, defaults, options);
        var categories = $.map(data, function(item) {
            return item.name;
        });

        $canvas.highcharts({
            chart: { type: param.type },
            title:{ text:null },
            legend:{ enabled:false },
            credits: { enabled: false },

            xAxis:{
                categories: categories,
                title:{ text:null }
            },
            yAxis:{
                minTickInterval: 1,
                title:{ text:null },
                labels: {
                    formatter: function () {
                        return this.value + '%';
                    }
                },
            },

            tooltip: {
                 valueSuffix: '%'
            },

            series: [{
                name: 'Total',
                type: param.type,
                data: data
            }]
        });
    };

    Reports.prototype._initHighmapPlugin = function($canvas, data, options) {
        // API: http://api.highcharts.com/highmaps
        var defaults = {
            type: 'column'
        };

        console.log('=== MAP ===');
        console.log(data);

        var param = $.extend({}, defaults, options);
        var categories = $.map(data, function(item) {
            return item.name;
        });

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
                        if (this.point.value > 0) {
                            return this.point.properties['hc-a2']
                                 + '<br/>'
                                 + '<small>' + this.point.value + '%</small>';
                            //'<div class="af--{point.value}">{point.properties.hc-a2} <br/><small>{point.value}%</small></div>'
                        } else {
                            return false;
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
    };

    Reports.prototype._initMorrisPlugin = function($canvas, data, options) {
        var defaults = {
            element: $canvas.get(0),
            data: data,
            formatter: function (x) { return x + "%"}
        };

        var param = $.extend({}, defaults, options);

        Morris.Donut(param);
    };

    Reports.prototype._initWordCloudPlugin = function($canvas, data, options) {
        var defaults = {
            list: data,
            color: 'random-dark',
            fontFamily: 'Helvetica',
            rotateRatio: .2,
            weightFactor: 1.5,
            gridSize: 10,
            ellipticity: .5,
            color: function (word, weight) {
                return (weight > 30) ? (weight > 55 ? 'red' : '#4dbc72') : '#c4e4c5';
            }
        };

        var param = $.extend({}, defaults, options);

        WordCloud($canvas.get(0), param);
    };

    return Reports;
})(jQuery, window);