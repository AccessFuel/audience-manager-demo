define(function (require) {
    var $ = require('jquery');

    // Template scripts
    require('global');

    // Libraries
    // ---------
    var AdminAPI = require('adminAPI'),
        EngineAPI = require('engineAPI'),
        Error = require('components/error'),
        Filter = require('components/filter'),
        Handlebars = require('handlebars'),
        HashNavigation = require('components/hashNavigation'),
        Navigation = require('components/navigation'),
        UploadProgress = require('components/uploadProgress'),
        Sort = require('components/sort'),
        Uploader = require('components/uploader'),
        Utils = require('utils/global');

    // Templates
    // ---------

    var Templates = {
        fileDatapoints: Handlebars.compile($("#template-file-datapoints").html()),
        fileDetails: Handlebars.compile($("#template-file-details").html()),
        fileStats: Handlebars.compile($("#template-file-stats").html()),
        fileStatsItem: Handlebars.compile($("#template-file-stats-item").html()),
        files: Handlebars.compile($("#template-files").html()),
        filesEmpty: Handlebars.compile($("#template-files-empty").html()),
        filesFilters: Handlebars.compile($("#template-files-filters").html()),
        filesList: Handlebars.compile($("#template-files-list").html()),
        progress: Handlebars.compile($("#template-progress").html())
    };

    var _toggleUploadFormVisibility = function(toggle) {
        $('.js-upload-form').toggleClass('af--hidden', !toggle);
    };

    var _getFileStats = function(projectID) {
        return Promise
            .resolve(EngineAPI.getStats(projectID))
            .then(function(data) {
                var parsedData = {};

                if (data.status === 'error') {
                    parsedData.error = data.msg;
                } else {
                    parsedData.dataPoints = _parseDataPoints(data);
                    parsedData.stats = _parseFileStats(data);

                    // Update useful attributes (matched data points)
                    parsedData.stats.usefulAttributes.value = parsedData.dataPoints.matched.length;
                    parsedData.stats.usefulAttributes.share = Utils.getTotalValueShare(parsedData.stats.usefulAttributes.value, parsedData.stats.attributes.value);
                }

                // Set useful attributes to other placeholders
                $('.js-file-details-matched-attributes').text(parsedData.stats.usefulAttributes.value);

                return parsedData;
            });
    };

    var _parseFileData = function(file) {
        return {
            fileInfo: file,
            ui: {
                uploadedDate: new Date(file.createdAt)
            }
        };
    };

    var _parseDataPoints = function(data) {
        return $.map(data.sheets, function(item) {
            var dataPoints = {
                matched: [],
                unmatched: [],
                total: item.sheet_report.length
            };

            $.each(item.sheet_report, function(_, item) {
                var itemData = {
                    label: item['Column'],
                    quality: item['Complete %']
                };

                if (item.results) {
                    itemData.title = item.results.summary.title;
                    dataPoints.matched.push(itemData);
                } else {
                    dataPoints.unmatched.push(itemData);
                }
            });

            return dataPoints;
        })[0];
    };

    var _parseFileStats = function(data) {
        return $.map(data.sheets, function(item) {

            var dataQuality = Utils.averageQuality(item.sheet_report, 'Complete %');
            var dataQualityModifier = Utils.getQualityClass(dataQuality);

            return {
                totalRows: {
                    label: 'Total Contact',
                    pluralize: true,
                    value: item.sheet_emails
                },
                emptyRows:{
                    label: 'Empty Contact',
                    pluralize: true,
                    value: item.sheet_empty
                },
                duplicateRows: {
                    label: 'Duplicate',
                    pluralize: true,
                    value: item.sheet_duplicate,
                    share: Utils.getTotalValueShare(item.sheet_duplicate, item.sheet_emails, true),
                },

                audience: {
                    label: 'Unique Email',
                    pluralize: true,
                    value: item.sheet_emails - item.sheet_duplicate,
                    share: Utils.getTotalValueShare(item.sheet_emails - item.sheet_duplicate, item.sheet_emails),
                },
                attributes: {
                    label: 'Attributes Given',
                    pluralize: false,
                    value: item.sheet_report.length
                },
                usefulAttributes: {
                    label: 'Useful Attribute',
                    pluralize: true,
                    value: 0
                },
                quality: {
                    label: 'Data Health Score',
                    pluralize: false,
                    value: dataQuality,
                    formattedValue: (dataQuality * 10).toFixed(1),
                    baseValue: 10,
                    modifier: 'af--quality-' + dataQualityModifier,
                    valueModifier: 'af--' + dataQualityModifier
                }
            };
        })[0];
    };

    var _parseFiles = function(files) {
        return files.map(_parseFileData);
    };

    var _parseFilters = function(files) {
        var years = [];
        var statuses = [];

        $.each(files, function(_, file) {
            var _year = new Date(file.createdAt).getFullYear();
            if (years.indexOf(_year) === -1) {
                years.push(_year);
            }

            var _status = file.status;
            if (statuses.indexOf(_status) === -1) {
                statuses.push(_status);
            }
        });

        return {
            years: years.sort(),
            statuses: statuses
        };
    };


    // Delete File
    var deleteFile = function(fileID, fileName) {
        var displayFileName = fileName ? '<strong>' + fileName + '</strong>' : 'your file';

        swal({
            title: "Are you sure?",
            text: "You are about to delete " + displayFileName + " from your files list.",
            html: true,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            return Promise
                .resolve(AdminAPI.deleteFile(fileID))
                .then(function() {
                    swal({
                        title: "Deleted!",
                        text: displayFileName + " has been deleted.",
                        html: true,
                        type: "success"
                    });

                    loadFilesList();
                });
        });
    };

    // Get File Details
    var loadFileDetails = function(fileID, showSuccessMessage) {
        return Promise
            .resolve(AdminAPI.getFile(fileID))
            .then(function(data) {
                showFileDetails(data, showSuccessMessage);
                showFileDetailsStats(data.project_id, showSuccessMessage);
                showFileDetailsDatapoints(data.project_id);
            }).catch(function() {
                Error({
                    error: 'File not found.'
                });
            });
    };

    var showFileDetailsStats = function(projectID, isJustUploaded) {
        return _getFileStats(projectID)
            .then(function(templateData) {
                templateData.isJustUploaded = isJustUploaded;

                var $statsContainer = $('#js-file-manager__file-details .js-file-stats');
                Utils.renderTemplate($statsContainer, Templates.fileStats, templateData);
                $statsContainer.removeClass('af--loading');
            });
    };

    var showFileDetailsDatapoints = function(projectID, isJustUploaded) {
        return _getFileStats(projectID)
            .then(function(templateData) {
                var $datapointsContainer = $('#js-file-manager__file-details .js-file-datapoints');
                Utils.renderTemplate($datapointsContainer, Templates.fileDatapoints, templateData);
                $datapointsContainer.removeClass('af--loading');
            });
    };

    var showFileInTheListStats = function(file) {
        var projectID = file.fileInfo.project_id;
        var $fileRow = $('#file-' + file.fileInfo.uuid);

        var _renderPartialData = function(partialContainerSelctor, partialData) {
            Utils.renderTemplate($fileRow.find(partialContainerSelctor), Templates.fileStatsItem, partialData);
        };

        return _getFileStats(projectID)
            .then(function(data) {
                // Modify data
                var templateData = {
                    audience: {
                        error: !data.stats.audience,
                        label: 'Contact',
                        pluralize: true,
                        value: data.stats.audience.value,
                        totalValue: data.stats.totalRows.value,
                    },
                    usefulAttributes: {
                        error: !data.stats.usefulAttributes,
                        label: 'Attribute',
                        pluralize: true,
                        value: data.stats.usefulAttributes.value,
                        totalValue: data.stats.attributes.value,
                    },
                    quality: {
                        error: !data.stats.quality,
                        label: 'Data Quality',
                        pluralize: false,
                        value: data.stats.quality.value,
                        formattedValue: data.stats.quality.formattedValue,
                        valueModifier:  data.stats.quality.valueModifier
                    }
                };

                // Render partial templates
                _renderPartialData('.js-file-stats-audiece', templateData.audience);
                _renderPartialData('.js-file-stats-attributes', templateData.usefulAttributes);
                _renderPartialData('.js-file-stats-quality', templateData.quality);

                // Add sorting data
                $fileRow.data('audience', templateData.audience.value);
                $fileRow.data('attributes', templateData.usefulAttributes.value);
                $fileRow.data('quality', templateData.quality.value);
            });
    };

    var showFileDetails = function(data, isJustUploaded) {
        var templateData = _parseFileData(data);

        // Show Upload Success message
        templateData.isJustUploaded = isJustUploaded;

        Utils.renderTemplate($('#js-file-manager__file-details'), Templates.fileDetails, templateData);
        Navigation.navigate('file-details');
    };

    // Get Files List
    var loadFilesList = function() {
        // Display spinner
        Navigation.navigate('loader');
        window.location.hash = '';

        return Promise
            .resolve(AdminAPI.getFiles())
            .then(showFilesList);
    };

    var showFilesList = function(data) {
        // Sho no files message and upload form
        if (!data || !data.length) {
            Utils.renderTemplate($('#js-file-manager__files'), Templates.filesEmpty, data);
            _toggleUploadFormVisibility(true);
            Navigation.navigate('files-empty');
            return;
        }

        var templateData = {
            files: _parseFiles(data),
            filters: _parseFilters(data)
        };

        Utils.renderTemplate($('#js-file-manager__files'), Templates.files, templateData);
        Utils.renderTemplate($('#js-file-manager__files-list'), Templates.filesList, templateData);

        if (templateData.files.length > 5) {
            Utils.renderTemplate($('#js-file-manager__filters'), Templates.filesFilters, templateData);
        }

        // Hide upload form
        _toggleUploadFormVisibility(false);

        // Init filters
        var $filesList = $('.js-files-list');
        Filter($filesList);
        Sort($filesList);

        // Request file stats
        $.each(templateData.files, function(i, file) {
            showFileInTheListStats(file);
        });

        Navigation.navigate('files');
    };

    // Upload File
    var uploadFile = function(files, useSampleDataFile) {
        if ( !files && !useSampleDataFile ) {
            return false;
        }

        var templateData = {
            title: useSampleDataFile
                ? 'Copying and Scanning Sample Data File'
                : 'Uploading and Scanning:',
            fileName: useSampleDataFile
                ? false
                : files.name,
            icon: useSampleDataFile
                ? 'copy'
                : 'cloud-upload'
        };

        // Display Progress bar
        Utils.renderTemplate($('#js-file-manager__progress'), Templates.progress, templateData);
        Navigation.navigate('progress');

        var data = new FormData();
        data.append('files', files);
        data.append('useSampleDataFile', useSampleDataFile);

        return UploadProgress(AdminAPI.upload(data)).then(function(values) {
            var response = values[0];

            if (!response.success && response.error) {
                Error(response);
            } else {
                window.location.pathname = '/crm/initial.html';
                window.location.hash = response.project_id;
                // loadFileDetails(response.uuid, true);
            }
        })
        .catch(function(response) {
            Error(response);
        });
    };

    var bindEventHandlers = function() {
        // Delete file
        $('body').on('click', '.js-delete-file[data-uuid]', function(e) {
            e.preventDefault();
            var $link = $(this);
            var fileID = $link.data('uuid');
            var fileName = $link.data('filename');

            deleteFile(fileID, fileName);
        });


        $('body').on('click', '.js-get-files-list', function(e) {
            e.preventDefault();
            loadFilesList();
        });
    };

    var hashNavigationCallback = function(params) {
        var fileID = params[0];

        Navigation.navigate('loader');

        if (fileID && fileID !== '') {
            // Get and display file details
            loadFileDetails(fileID);
        } else {
            // Get and display user files list
            loadFilesList();
        }
    };

    var init = function() {
        // Init upload form
        Uploader($('.js-upload-form'), uploadFile);

        // Bind event handlers
        HashNavigation(hashNavigationCallback);
        bindEventHandlers();
    };
    
    return init;
});