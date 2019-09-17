//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.
requirejs.config({
    baseUrl: '/dist/js/lib',
    paths: {
        app: '../app',
        components: '../components',
        plugins: '../plugins',
        utils: '../utils',
        global: '../app/_global',
        adminAPI: 'admin-api',
        engineAPI: 'engine-api',
        jquery: 'jquery-2.1.1',
        handlebarsCore: 'handlebars-v4.0.5',
        handlebars: '../utils/handlebars-helpers',
        metisMenu: '../plugins/metisMenu/jquery.metisMenu',
        slick: '../plugins/slick/slick.min',
        slimscroll: '../plugins/slimscroll/jquery.slimscroll.min',
        sweetAlert: '../plugins/sweetalert/dist/sweetalert.min',

        // Data Visualization plugins
        //cssCharts: '../plugins/reports/csscharts/jquery.chart.min',
        chart: '../plugins/reports/chart/Chart.min',
        highCharts: '../plugins/reports/highcharts/highcharts',
        highMapCore: '../plugins/reports/highcharts/map',
        highMapUS: '../plugins/reports/highcharts/maps/us-all',
        knob: '../plugins/reports/knob/dist/jquery.knob.min',
        wordcloud: '../plugins/reports/wordcloud/wordcloud2',

        // External plugins
        google: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAaPL_5SO8_4nQ27p_mu7ISyACnEpZdQ88',

        // Canned demo
        state: '../utils/state'
    },
    shim: {
        bootstrap: {
            deps: ['jquery']
        },
        handlebars: {
            deps: ['handlebarsCore']
        },
        inspinia: {
            deps: [
                'jquery',
                'bootstrap',
                'metisMenu',
                'slimscroll'
            ]
        },
        highCharts: {
            exports: "Highcharts",
            deps: ["jquery"]
        },
        highMapCore: {
            deps: ['highCharts']
        },
        highMapUS: {
            deps: ['highMapCore']
        },
        knob: {
            deps: ['jquery']
        },
        metisMenu: {
            deps: ['jquery']
        },
        slimscroll: {
            deps: ['jquery']
        },
        slick: {
            deps: ['jquery']
        }
    }
});