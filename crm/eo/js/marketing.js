var MarketingUI = (function($, window) {
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
            type: 'line',
            data: {
                labels : ["May", "June", "July", "August", "September", "October", "November", "December"],
                datasets : [
                    {
                        label: "Projected Ticket Sales",
                        backgroundColor : "rgba(220,220,220,0.2)",
                        borderColor : "rgba(220,220,220, 0.5)",
                        pointBackgroundColor : "rgba(220,220,220,.5)",
                        data : [300, 400, 600, 800, 800, 500, 300, 250, 200]
                    },
                    {
                        label: "Actual Ticket Sales",
                        backgroundColor : "rgba(223,127,134,0.2)",
                        borderColor: "rgba(223,127,134,1)",
                        strokeColor : "rgba(223,127,134,1)",
                        pointBackgroundColor : "rgba(223,127,134,1)",
                        data : [170, 310, 447, 890, 440]
                    }
                ]
            },
            options: {
                legend: {
                    display: false,
                },
                responsive: true,
            }
        };

        var ctx = document.getElementById("ticketSalesChart").getContext("2d");
        setTimeout(() => new Chart(ctx, lineChartData));
    }

    Controller.prototype.bindHandlers = function() {
    };

    return Controller;
})(jQuery, window);
