(function($, window) {
    $(function() {

        var Controller = function() {
            this.init();
            this.bindHandlers();
            this.renderWidgets();
            this.renderTicketSalesChart();
        }

        Controller.prototype.init = function() {
            this.Data = {};
            this.Widgets = ['daysLeft', 'ticketsSold', 'ticketsRevenue', 'marketingChannels'];
        };

        Controller.prototype.renderWidgets = function(data) {
            this.getDefaultData();

            var setWidget = function(_, widgetID) {
                switch(widgetID) {
                    default:
                        return;
                    case 'daysLeft':
                        new WidgetUI(widgetID, [this.Data.status.daysLeft, this.Data.status.weeksLeft]);
                        break;
                    case 'ticketsSold':
                        var options = {
                            height: 168,
                            width: 168
                        };
                        new WidgetUI(widgetID, [this.Data.status.ticketsSold], options);
                        break;
                    case 'ticketsRevenue':
                        new WidgetUI(widgetID, [this.Data.status.ticketsRevenue]);
                        break;
                    case 'marketingChannels':
                        new WidgetUI(widgetID, [this.Data.status.marketingChannels]);
                        break;
                }
            };

            $.each(this.Widgets, $.proxy(setWidget, this));
        };

        Controller.prototype.getDefaultData = function(data) {
            this.Data.status = {};

            // Fake static data
            this.Data.status.daysLeft = 158;
            this.Data.status.weeksLeft = parseInt(this.Data.status.daysLeft/7);
            this.Data.status.ticketsRevenue = 112846;
            this.Data.status.marketingChannels = 9;

            this.Data.status.ticketsSold = {
                value: 2257,
                total: 5000
            };

        };

        Controller.prototype.renderTicketSalesChart = function() {
            var lineChartData = {
                labels : ["May", "June", "July", "August", "September", "October", "November", "December"],
                datasets : [
                    {
                        label: "Projected Ticket Sales",
                        fillColor : "rgba(220,220,220,0.2)",
                        strokeColor : "rgba(220,220,220, 0.5)",
                        pointColor : "rgba(220,220,220,0.5)",
                        pointStrokeColor : "#fff",
                        pointHighlightFill : "#fff",
                        pointHighlightStroke : "rgba(220,220,220,1)",
                        data : [300, 400, 600, 800, 800, 500, 300, 250, 200]
                    },
                    {
                        label: "Actual Ticket Sales",
                        fillColor : "rgba(223,127,134,0.2)",
                        strokeColor : "rgba(223,127,134,1)",
                        pointColor : "rgba(223,127,134,1)",
                        pointStrokeColor : "#fff",
                        pointHighlightFill : "#fff",
                        pointHighlightStroke : "rgba(151,187,205,1)",
                        data : [170, 310, 447, 890, 440]
                    }
                ]
            };

            var ctx = document.getElementById("ticketSalesChart").getContext("2d");
            window.myLine = new Chart(ctx).Line(lineChartData, {
                responsive: true
            });
        }

        Controller.prototype.bindHandlers = function() {
        };

        var sponsorsController = new Controller();

    });
})(jQuery, window);