(function($, window) {
    $(function() {

        var Controller = function() {
            this.init();
            this.bindHandlers();
            this.renderWidgets();
        }

        Controller.prototype.init = function() {
            this.Data = {};
            this.Widgets = ['offersClosed', 'collectedRevenue', 'pendingRevenue'];
        };

        Controller.prototype.renderWidgets = function(data) {
            this.getDefaultData();

            var setWidget = function(_, widgetID) {
                switch(widgetID) {
                    default:
                        return;
                    case 'offersClosed':
                        new WidgetUI(widgetID, [this.Data.status.offersClosed]);
                        break;
                    case 'collectedRevenue':
                        new WidgetUI(widgetID, [this.Data.status.collectedRevenue]);
                        break;
                    case 'pendingRevenue':
                        new WidgetUI(widgetID, [this.Data.status.pendingRevenue]);
                        break;
                }
            };

            $.each(this.Widgets, $.proxy(setWidget, this));
        };

        Controller.prototype.getDefaultData = function(data) {
            this.Data.status = {};

            // Fake static data
            this.Data.status.collectedRevenue = 750000;
            this.Data.status.pendingRevenue = 4700000;

            this.Data.status.offersClosed = {
                value: 1,
                total: 5
            };

        };

        Controller.prototype.bindHandlers = function() {
        };

        var sponsorsController = new Controller();

    });
})(jQuery, window);