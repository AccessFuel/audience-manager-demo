(function($, window) {
    $(function() {

        var Controller = function() {
            this.init();
            this.bindHandlers();
        }

        Controller.prototype.init = function() {
            this.Data = {};
            this.navigationUI = new NavigationUI($.proxy(this.navigateCallback, this));
            this.JobID = AccessfuelAPI.getQueryParameter('job');

            if (!this.JobID) {
                this.navigationUI.navigate('upload');
            } else {
                // TODO: get bseline data from API
                // in the same format as after uploading file
                //this.navigationUI.navigate('baseline');
                this.navigationUI.navigate('upload');
            }


        };

        Controller.prototype.navigateCallback = function(step) {
            switch(step) {
                case 'upload':
                    this.initUpload();
                    break;
                case 'progress':
                    this.initProgress();
                    break;
                case 'baseline':
                    this.initBaseline();
                    break;
                case 'enhance':
                    this.initEnhance();
                    break;
                default:
                    break;
            }
        };

        Controller.prototype.initUpload = function() {
            // Init Drag-n-drop upload form
            this.uploadUI = new UploadUI($.proxy(this.uploadPost, this));
        };

         Controller.prototype.uploadPost = function(file) {
            if (!file) {
                return false;
            }
            this.navigationUI.navigate('progress');

            var data = new FormData();
            data.append('file', file);
            AccessfuelAPI.ajax_it('upload', 'POST', data, $.proxy(this.uploadGet, this));
        };

        Controller.prototype.uploadGet =  function(data) {
            if ('status' in data) {
                if (data.status == "Error") {
                    this.progressUI.interrupt('Error', data.message);
                    return;
                }
            }

            this.Data.baseline = data;
        };

        Controller.prototype.initProgress = function() {
            // Uploading progress
            $('.js-navigation-step-title.js--enhance').prop('hidden', true);
            $('.js-navigation-step-title.js--progress').prop('hidden', false);

            // Start process with uploading only
            // the uppload callback should setup the rest of the process
            // this is just in case upload would take too long.

            var initialData = [{
                time: 2,
                name: 'Upload user database file',
                label: 'Uploading file'
            },{
                time: 2,
                name: 'Detect file structure',
                label: 'Detecting file structure'
            },{
                time: 2,
                name: 'Match data fields to available reports',
                label: 'Recognizing data fields'
            },{
                time: 0,
                delay: 2,
                name: 'Done',
                label: 'Loading Baseline…',
                callback: $.proxy(function() {
                    this.navigationUI.navigate('baseline');
                }, this)
            }];


            this.progressUI = new ProgressUI(initialData);

            // Check for upload is finished
            var _checkUploadStatus = function() {
                if (!this.Data.baseline) {
                    window.setTimeout($.proxy(_checkUploadStatus, this), 1000);
                    this.progressUI.updateStepTimer(1);
                }
            };

            $.proxy(_checkUploadStatus, this)();

        };

        Controller.prototype.initEnhance = function() {

            $('.js-navigation-step-title.js--progress').prop('hidden', true);
            $('.js-navigation-step-title.js--enhance').prop('hidden', false);

            var initialData = [{
                time: 1,
                name: 'Starting enhancement.',
                label: 'Starting…'
            },{
                time: 10000,
                name: 'Enhancing data from private network',
                label: 'Connecting…'
            },{
                time: 1,
                name: 'Preparing your audience insights report',
                label: 'Loading…'
            }, {
                time: 0,
                delay: 2,
                name: 'Done',
                label: 'Complete, redirecting…',
                callback: $.proxy(function() {
                    this.goToReports();
            }, this)}];

            this.progressUI = new ProgressUI(initialData);

            AccessfuelAPI.start_job(this.Data.baseline.file_id, $.proxy(this.enhanceGet, this));
        };

        Controller.prototype.enhanceGet =  function(data) {
            var checkPeriod = 3;
            this.Data.enhance = data;
            this.JobID = this.Data.enhance.job_id;

            var _checkJobResults = function(data) {
                if (!data || !data.details || data.details.total_items != data.total_items_completed) {
                    this.Data.JobStatus = false;

                    if (data && data.details && data.details.total_items && data.total_items_completed) {
                        var progress = data.total_items_completed / data.details.total_items;
                        this.progressUI.updateStepProgress(progress, checkPeriod);
                    }

                    window.setTimeout($.proxy(_getJobResults, this), checkPeriod * 1000);
                } else {
                    this.progressUI.updateStepProgress(1);
                    this.Data.JobStatus = data.details;
                }
            };

            var _getJobResults = function() {
                AccessfuelAPI.get_status(this.Data.enhance.job_id,  $.proxy(_checkJobResults, this));
            };


            $.proxy(_checkJobResults, this)();
        };

        Controller.prototype.initBaseline = function() {
            this.baselineUI = new BaselineUI(this.Data.baseline);
        };

        Controller.prototype.bindHandlers = function() {
            var $page = $('#page-wrapper');

            // Enhance fields checkboxes
            $page.on('change', '.js-enhance-field-select', function() {
                var $checkbox = $(this);
                $checkbox.parent().toggleClass('u-text-pale', !$(this).is(':checked'));

                // Toggle calls to action
                if ( !$('.js-enhance-field-select:checked').length ) {
                    $('#enhanceCTA').prop('hidden', true);
                    $('#reportCTA').prop('hidden', false);
                } else {
                    $('#reportCTA').prop('hidden', true);
                    $('#enhanceCTA').prop('hidden', false);
                }
            });

            // CTAs
            $page.on('click', '.js-enhance-link', $.proxy(function(e) {
                e.preventDefault();
                this.navigationUI.navigate('enhance')
            }, this));

            $page.on('click', '.js-audience-link', $.proxy(function(e) {
                e.preventDefault();
                if (this.JobID) {
                    this.goToReports();
                } else {
                    this.navigationUI.navigate('enhance')
                }
            }, this));
        };

        Controller.prototype.goToReports = function() {
            if (!this.JobID) {
                return false;
            }
            window.location = "audience.html?job=" + this.JobID;
        };

        var uploadController = new Controller();

    });
})(jQuery, window);