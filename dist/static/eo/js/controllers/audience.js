(function($, window) {
    $(function() {

        var Controller = function() {
            this.init();
            this.bindHandlers();
        };

        Controller.prototype.init = function() {
            this.Data = {};
            this.Reports;

            this.Widgets = ['dataSummary'];
            this.ReportsSequence = ['gender', 'age', 'state', 'city', 'zip_code', 'industry', 'company', 'job_title', 'employment_domain', 'skills__name', 'education', 'twitter_followers'];

            this.lockedReports = [];
            this.JobID = AccessfuelAPI.getQueryParameter('job');
            this.$reportsContainer = $('#reportsContainer');

            this.navigationUI = new NavigationUI();

            if (!this.JobID) {
                window.location = 'home.html';
            } else {
                this.initReports();
            }
        };

        Controller.prototype.initReports = function() {
            this.reportsUI = new ReportsUI();

            // Get data for widgets
            AccessfuelAPI.get_status(this.JobID,  $.proxy(this.renderWidgets, this));

            // Get reports data
            AccessfuelAPI.get_results(this.JobID,  $.proxy(this.renderReports, this));
        };

        Controller.prototype.renderReports = function(data) {
            if (data.STATUS && data.STATUS === "NOT COMPLETE") {
                window.setTimeout($.proxy(this.renderReports, this), 3000);
                return false;
            }

            this.Reports = data;
            this.reportsUI.createReports(this.ReportsSequence, this.$reportsContainer, this.Reports);


            // Init carousel
            this.$reportsContainer.slick({
                prevArrow: '<button type="button" class="af-slider__control af--previous">&lsaquo;</button>',
                nextArrow: '<button type="button" class="af-slider__control af--next">&rsaquo;</button>',
                customPaging: function(slider, i) {
                    // Get rid of quality
                    var $title = $(slider.$slides[i]).find('.af-report__title').clone();
                    $title.children().remove();

                    return '<button class="af-slider__tab">' + $title.text() + '</button>';
                },
                dots: true,
                infinite: true,
                speed: 150
            });
        };

        Controller.prototype.renderWidgets = function(data) {
            this.parseStatusData(data);

            var setWidget = function(_, widgetID) {
                switch(widgetID) {
                    default:
                        return;
                    case 'dataSummary':
                        new WidgetUI(widgetID, [this.Data.status.uniqueRows, this.Data.status.duplicateRows]);
                        break;
                }
            };

            $.each(this.Widgets, $.proxy(setWidget, this));

            // Navigate
            this.navigationUI.navigate('reports');
        };

        Controller.prototype.parseStatusData = function(data) {
            this.Data.status = {};

            this.Data.status.source = data;
            this.Data.status.uniqueRows = this.Data.status.source['total_items_completed'] || 0;

            // TODO: fake data, should be returned by API
            this.Data.status.duplicateRows = 52;
        };

        Controller.prototype.bindHandlers = function() {
            var $page = $('#page-wrapper');

            // CTAs
            $page.on('click', '.js-enhance-link', $.proxy(function(e) {
                e.preventDefault();
                this.goToEnhance();
            }, this));
        };

        Controller.prototype.goToEnhance = function() {
            if (!this.JobID) {
                return false;
            }
            window.location = "upload.html?job=" + this.JobID;
        };


        var audienceController = new Controller();

    });
})(jQuery, window);