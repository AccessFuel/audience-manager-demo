define(function (require) {
    var $ = require('jquery');

    var Error = require('components/error'),
        VisualizationChart = require('components/visualization-chart'),
        VisualizationGoogleMap = require('components/visualization-google-map'),
        VisualizationMap = require('components/visualization-map'),
        VisualizationWordcloud = require('components/visualization-wordcloud');


    var $ReportCanvas;

    var _createChartReport = function(id, data, params) {
        $ReportCanvas
            .find('.js-report-container')
            .addClass('af--chart')
            .addClass('af--' + id);
        return VisualizationChart(data, params);
    };

    var _createGoogleMapReport = function(id, data, params) {
        $ReportCanvas
            .find('.js-report-container')
            .addClass('af--google-map')
            .addClass('af--' + id);
        return VisualizationGoogleMap(data, params);
    };

    var _createHighchartsMapReport = function(id, data, params) {
        $ReportCanvas
            .find('.js-report-container')
            .addClass('af--map')
            .addClass('af--' + id);
        return VisualizationMap(data, params);
    };

    var _createWordcloudReport = function(id, data, params) {
        $ReportCanvas
            .find('.js-report-container')
            .addClass('af--wordcloud')
            .addClass('af--' + id);
        return VisualizationWordcloud(data, params);
    };


    var createDefaultChartReport = function(reportData) {
        return _createChartReport(reportData.summary.id, reportData.data, {});
    };

    var createDefaultWordcloudReport = function(reportData) {
        return _createWordcloudReport(reportData.summary.id, reportData.data, {});
    };


    var createAgeReport = function(reportData) {
        return _createChartReport('age', reportData.data, {
            type: 'vertical',
            name: 'age',
            weightAxis: true,
            max: 10
        });
    };

    var createCityReport = function(reportData) {
        // TODO:
        // 1. API should return data sorted by value
        // 2. API should combine States data with Cities to perform a drill on a single chart/map
        return _createChartReport('city', reportData.data, {
            type: 'horizontal',
            name: 'cities'
        });
    };

    var createEducationReport = function(reportData) {
        return _createWordcloudReport('education', reportData.data, {
            fontFamily: 'Baskerville'
        });
    };

    var createEmploymentDomainReport = function(reportData) {
        return _createWordcloudReport('employment',  reportData.data, {
            fontFamily: 'Futura',
            colorScheme: 'Gray'
        });
    };

    var createGenderReport = function(reportData) {
        var _parseJSON = function(id) {
            return reportData.data.filter(function(data) {
                return data.label === id;
            })[0];
        };

        var _parseData = function() {
            var dataSequence = ['male', 'female'];
            return dataSequence.map(_parseJSON);
        };

        var data = _parseData();

        return _createChartReport('gender', data, {
            type: 'vertical',
            name: 'gender',
            max: 2
        });
    };

    var createStateReport = function(reportData) {
        return _createHighchartsMapReport('state', reportData.data);
    };

    var createTwitterReport = function(reportData) {
        return _createChartReport('twitter', reportData.data, {
            type: 'vertical',
            name: 'twitter',
            max: 10
        });
    };

    var createZipCodeReport = function(reportData) {
        return _createGoogleMapReport('zip', reportData.data);
    };


    var createVisualization = function(reportData) {
        switch (reportData.summary.id) {
            default:
                return createDefaultChartReport(reportData);
            case 'age':
                return createAgeReport(reportData);
            case 'city':
                return createCityReport(reportData);
            case 'education':
                return createEducationReport(reportData);
            case 'employment_domain':
                return createEmploymentDomainReport(reportData);
            case 'gender':
                return createGenderReport(reportData);
            case 'industry':
                return createDefaultChartReport(reportData);
            case 'job_title':
                return createDefaultWordcloudReport(reportData);
            case 'skills__name':
                return createDefaultWordcloudReport(reportData);
            case 'state':
                return createStateReport(reportData);
            case 'twitter_followers':
                return createTwitterReport(reportData);
            case 'zip_code':
                return createZipCodeReport(reportData);
        }
    };

    var init = function($canvas, reportData) {
        if (!$canvas.length || !reportData || !reportData.summary) {
            return Error({
                error: 'Can’t create report visualization.'
            });
        }

        $ReportCanvas = $canvas;

        $ReportCanvas
            .find('.js-report-canvas')
            .empty()
            .append(createVisualization(reportData));
    };

    return init;
});