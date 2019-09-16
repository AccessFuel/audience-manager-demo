define(function (require) {
    var $ = require('jquery');

    // Template scripts
    require('global');

    // Libraries
    // ---------
    var AdminAPI = require('adminAPI'),
        EngineAPI = require('engineAPI'),
        Error = require('components/error'),
        Handlebars = require('handlebars'),
        HashNavigation = require('components/hashNavigation'),
        Navigation = require('components/navigation'),
        Report = require('components/report'),
        Utils = require('utils/global');

    var ReportData = false;
    var Project = {};

    var $reportContainer = $('#report-content');
    var $reportNavigation = $('#report-nav');

    var ReportSchema = [{
            groupTitle: 'Demographics',
            groupIcon: 'users',
            reports: [{
                    id: 'gender',
                    title: 'Gender'
                }, {
                    id: 'age',
                    title: 'Age'
                }, {
                    id: 'income',
                    title: 'Income'
                }]
        }, {
            groupTitle: 'Psychographics',
            groupIcon: 'heartbeat',
            reports: [{
                    id: 'interest',
                    title: 'Interest'
                }, {
                    id: 'bio',
                    title: 'Bio'
                }]
        }, {
            groupTitle: 'Location',
            groupIcon: 'street-view',
            reports: [{
                    id: 'city',
                    title: 'City'
                }, {
                    id: 'state',
                    title: 'State'
                }, {
                    id: 'zip_code',
                    title: 'Zip Code'
                }]
        }, {
            groupTitle: 'Education',
            groupIcon: 'mortar-board',
            reports: [{
                    id: 'education',
                    title: 'Overview',
                    hideEmpty: true
                }, {
                    id: 'university',
                    title: 'University'
                }, {
                    id: 'degree',
                    title: 'Degree'
                }, {
                    id: 'major',
                    title: 'Major'
                }]
        }, {
            groupTitle: 'Occupation',
            groupIcon: 'briefcase',
            reports: [{
                    id: 'employment_domain',
                    title: 'Overview',
                    hideEmpty: true
                }, {
                    id: 'company',
                    title: 'Company'
                }, {
                    id: 'job_title',
                    title: 'Job Title'
                }, {
                    id: 'skills__name',
                    title: 'Skills'
                }, {
                    id: 'industry',
                    title: 'Industry'
                }]
        }, {
            groupTitle: 'Influence',
            groupIcon: 'share-alt',
            reports: [{
                    id: 'twitter_followers',
                    title: 'Twitter Followers'
                }]
        }];

    var Templates = {
        reportCanvas: Handlebars.compile($("#template-report-canvas").html()),
        reportNav: Handlebars.compile($("#template-report-nav").html()),
        reportPromoStart: Handlebars.compile($("#template-report-promo-start").html()),
        reportPersonas: [
            Handlebars.compile($("#template-report-persona-1").html()),
            Handlebars.compile($("#template-report-persona-2").html()),
            Handlebars.compile($("#template-report-persona-3").html())
        ],
        reportPromoEnd: Handlebars.compile($("#template-report-promo-end").html())
    };

    var parseReportData = function(data) {
        ReportData = {
            groups: ReportSchema,
            data: []
        };

        $.each(ReportData.groups, function(g, reportGroup) {
            reportGroup.enabled = false;

            $.each(reportGroup.reports, function(r, groupItem) {
                groupItem.report = false;

                $.each(data, function(_, dataItem) {
                    if (dataItem.summary && dataItem.summary.id === groupItem.id) {
                        reportGroup.enabled = true;
                        groupItem.report = true;
                        ReportData.data.push(dataItem);
                        return false;
                    }
                });
            });
        });

        return ReportData;
    };

    var getReportData = function(reportID) {
        return ReportData.data.filter(function(report) {
            return report.summary.id === reportID;
        })[0];
    };

    var getReportIndex = function(reportID) {
        for (var i = 0; i < ReportData.data.length; i++) {
            if (ReportData.data[i].summary.id === reportID) {
                return i;
            }
        }

        return false;
    };

    var getNextReportID = function(reportID) {
        var currentReportIndex = getReportIndex(reportID);

        if (currentReportIndex === false || currentReportIndex === ReportData.data.length - 1) {
            return false;
        }

        return ReportData.data[currentReportIndex + 1].summary.id;
    };

    var getPreviousReportID = function(reportID) {
        var currentReportIndex = getReportIndex(reportID);

        if (!currentReportIndex) {
            return false;
        }

        return ReportData.data[currentReportIndex - 1].summary.id;
    };

    // Get File Details
    var loadReport = function() {
        // Display spinner
        Navigation.navigate('loader');

        var successCallback = function(data) {
            parseReportData(data);
            showReportNav();

            Navigation.navigate('report');
            HashNavigation(hashNavigationCallback);
        };

        return Promise
            .resolve(EngineAPI.getReport(Project))
            .then(function(response) {
                if (response.status === 'error') {
                    Error(response);
                } else {
                    successCallback(response);
                }
            })
            .catch(function(response) {
                Error(response);
            });
    };

    var showReportNav = function() {
        Utils.renderTemplate($reportNavigation, Templates.reportNav, ReportData);
    };

    var setReportNavGroup = function(groupID) {
        var group = ReportData.groups[groupID];
        if (!group) {
            return;
        }

        $.each(group.reports, function(_, report) {
            if (report.report) {
                navigate(report.id);
                return false;
            }
        });
    };

    var setReportNavItem = function (reportID) {
        var $navItems = $reportNavigation.find('.af-report-nav__item');
        $navItems.filter('.af--active').removeClass('af--active');

        if (!reportID) {
            return;
        }

        var $currentItem = $navItems.filter('[data-report="' + reportID + '"]');
        var $groupItem = $currentItem.parents('.af-report-nav__item');

        $groupItem.addClass('af--active');
        $currentItem.addClass('af--active');

        // Set Previous & Next report links
        var currentIndex = getReportIndex(reportID);

        setCurrentReportSlide('.js-report-current', currentIndex);
        setPrevNextLinks('.js-report-prev', currentIndex === 0 ? 'persona3' : getPreviousReportID(reportID));
        setPrevNextLinks('.js-report-next', currentIndex === ReportData.data.length - 1 ? 'end' : getNextReportID(reportID));
    };

    // Set “Report X of Y” text
    var setCurrentReportSlide = function(selector, reportIndex) {
        if (reportIndex !== false && ReportData && ReportData.data.length) {
            $reportNavigation.find(selector).text('Initial Insights Report #' + (reportIndex + 1) + ' of ' + ReportData.data.length);
        }
    };

    // Set Previous & Next report links
    var setPrevNextLinks = function(linkSelector, reportID) {
        var $link = $reportNavigation.find(linkSelector);
        if (reportID) {
            $link.attr('href', '#' + reportID).removeClass('af--disabled');
        } else {
            $link.removeAttr('href').addClass('af--disabled');
        }
    };

    var showReport = function(reportID) {
        var report = getReportData(reportID);

        if (report) {
            Utils.renderTemplate($reportContainer, Templates.reportCanvas, report);
            Report($reportContainer, report);
        } else {
            Error({
                error: 'This Project does’t have ' + reportID + ' report.'
            });
        }
    };

    var showPromo = function(promoID) {
        var navigationText;
        var nextID = false;
        var previousID = false;
        var promoTemplate;
        var promoTemplateData = {
            dataLength: ReportData.data.length
        };

        switch (promoID) {
            default: return;
            case 'start':
                nextID = 'persona1';
                navigationText = '<a href="#' + ReportData.data[0].summary.id + '">View Audience Report <small><i class="fa fa-play"></i></small><a>';
                promoTemplate = Templates.reportPromoStart;
                break;
            case 'persona1':
                nextID = 'persona2';
                previousID = 'start';
                navigationText = 'Persona #1 of 3';
                promoTemplate = Templates.reportPersonas[0];
                break;
            case 'persona2':
                nextID = 'persona3';
                previousID = 'persona1';
                navigationText = 'Persona #2 of 3';
                promoTemplate = Templates.reportPersonas[1];
                break;
            case 'persona3':
                nextID = ReportData.data[0].summary.id;
                previousID = 'persona2';
                navigationText = 'Persona #3 of 3';
                promoTemplate = Templates.reportPersonas[2];
                break;
            case 'end':
                previousID = ReportData.data[ReportData.data.length - 1].summary.id;
                navigationText = '<a href="#start"><small><i class="fa fa-step-backward"></i></small>  Start Over<a>';
                promoTemplate = Templates.reportPromoEnd;
                break;
        }

        Utils.renderTemplate($reportContainer, promoTemplate, promoTemplateData);
        
        // Set Previous & Next report links
        $reportNavigation.find('.js-report-current').html(navigationText);
        setPrevNextLinks('.js-report-prev', previousID);
        setPrevNextLinks('.js-report-next', nextID);
    };

    var bindEventHandlers = function() {
        $reportNavigation.on('click', '.af-report-nav__item a[data-group]', function(e) {
            e.preventDefault();
            setReportNavGroup($(this).data('group'));
        });
    };

    var navigate = function(reportID) {
        if (reportID) {
            window.location.hash = reportID;
        }
    };

    var hashNavigationCallback = function(params) {
        var reportID = params ? params[0] : false;

        // Handle promos
        if (!reportID || reportID === '') {
            reportID = 'start';
        } 
        
        if (reportID === 'start' || reportID === 'persona1' || reportID === 'persona2' || reportID === 'persona3' || reportID === 'end') {
            setReportNavItem(false);
            showPromo(reportID);
        } else {
            setReportNavItem(reportID);
            showReport(reportID);
        }
    };

   var init = function(project) {
        Project = project;

        // Get and display user files list
        loadReport();

        // Bind event handlers
        bindEventHandlers();
    };

    return init;
});