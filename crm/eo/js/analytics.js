const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const DATA = {
    persona1: {
        conversion: [
            {
                facebook: 0,
                mailchimp: 4.1273,
                hubspot: 0,
            }, {
                facebook: 6.1,
                mailchimp: 4.8932,
                hubspot: 0,
            }, {
                facebook: 14.333,
                mailchimp: 3.9912,
                hubspot: 4.9222,
            }, {
                facebook: 20.9112,
                mailchimp: 4.7553,
                hubspot: 7.1551,
            }, {
                facebook: 19.7722,
                mailchimp: 6.1922,
                hubspot: 9.1210,
            }, {
                facebook: 22.1441,
                mailchimp: 7.4213,
                hubspot: 10.0012,
            },
        ],
    },
    persona2: {
        conversion: [
            {
                facebook: 0,
                mailchimp: 4.1273,
                hubspot: 0,
            }, {
                facebook: 6.1,
                mailchimp: 4.8932,
                hubspot: 0,
            }, {
                facebook: 14.333,
                mailchimp: 3.9912,
                hubspot: 4.9222,
            }, {
                facebook: 10.9112,
                mailchimp: 4.7553,
                hubspot: 7.1551,
            }, {
                facebook: 9.7722,
                mailchimp: 6.1922,
                hubspot: 9.1210,
            }, {
                facebook: 7.1441,
                mailchimp: 5.4213,
                hubspot: 8.0012,
            },
        ],
    },
};

const createSampleDataset = (dataSample) => ({
    labels: dataSample.map((d, i) => MONTHS[moment().subtract(dataSample.length - i - 1, 'months').month()]),
    facebook: dataSample.map((d) => d.facebook),
    mailchimp: dataSample.map((d) => d.mailchimp),
    hubspot: dataSample.map((d) => d.hubspot),
})

AnalyticsUI = (function($, window) {
    var Controller = function() {
        setTimeout(() => {
            this.bindHandlers();
            this.renderConversionChangeChart();
            this.renderConversionPlatformsChart();
        });
    }

    Controller.prototype.renderConversionChangeChart = () => {
        const renderChart = (id, data) => {
            const ctx = document.getElementById(id).getContext('2d');
            const dataset = createSampleDataset(data);
            const config = {
                type: 'line',
                data: {
                    labels: dataset.labels,
                    datasets: [{
                        label: "Facebook",
                        backgroundColor: 'rgba(58,85,159,.1)',
                        borderColor: 'rgba(58,85,159,.75)',
                        pointBackgroundColor: 'rgba(58,85,159,.75)',
                        data: dataset.facebook,
                    }, {
                        label: "MailChimp",
                        backgroundColor: 'rgba(9,9,9,.1)',
                        borderColor: 'rgba(9,9,9,.5)',
                        pointBackgroundColor: 'rgba(255,224,27,.5)',
                        data: dataset.mailchimp,
                    }, {
                        label: "Hubspot",
                        backgroundColor: 'rgba(243,119,58,.1)',
                        borderColor: 'rgba(243,119,58,.75)',
                        pointBackgroundColor: 'rgba(243,119,58,.75)',
                        data: dataset.hubspot,
                    }],
                },
                options: {
                    responsive: true,
                    scales: {
                        yAxes: [{
                            ticks: {
                                min: 0,
                                callback: function(value, index, values) {
                                    return `${value}%`;
                                }
                            }
                        }]
                    }
                }
            };

            new Chart(ctx, config);
        };

        renderChart('person1-conversion-change', DATA.persona1.conversion);
        renderChart('person2-conversion-change', DATA.persona2.conversion);
        
		
    };

    Controller.prototype.renderConversionPlatformsChart = () => {
        const renderChart = (id, data) => {
            const ctx = document.getElementById(id).getContext('2d');
            const dataset = Object.values(data.slice(-1)[0]);
            const config = {
                type: 'radar',
                data: {
                    labels: ['', 'Facebook', 'MailChimp', 'Hubspot'],
                    datasets: [{
                        backgroundColor: 'rgba(129,198,132,.1)',
                        borderColor: 'rgba(129,198,132,1)',
                        pointBackgroundColor: 'rgba(129,198,132,1)',
                        data: [0, ...dataset],
                    }],
                },
                options: {
                    responsive: true,
                    legend: {
                        display: false,
                    },
                    scale: {
                    	ticks: {
                            beginAtZero: true,
                            callback: function(value, index, values) {
                                return `${value}%`;
                            }
                    	}
                    }
                },
            };

            new Chart(ctx, config);
        };

        
        renderChart('person1-conversion-platforms', DATA.persona1.conversion);
        renderChart('person2-conversion-platforms', DATA.persona2.conversion);
    }

    Controller.prototype.bindHandlers = () => {
    };

    return Controller;
})(jQuery, window);
