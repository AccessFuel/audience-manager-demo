define(function (require) {

    require('knob');

    var DEFAULT_PROGRESS_DATA = [{
        time: 3,
        name: 'Uploading',
        label: 'Uploading'
    }, {
        time: 5,
        name: 'Interpreting',
        label: 'Interpreting'
    }, {
        time: 4,
        name: 'Identifying duplicates',
        label: 'Identifying duplicates'
    }, {
        time: 7,
        name: 'Analyzing',
        label: 'Analyzing'
    }, {
        time: 2,
        name: 'Calculating data health',
        label: 'Calculating data health'
    }, {
        time: 5,
        name: 'Creating Report',
        label: 'Creating Report'
    }, {
        time: 0,
        delay: 2,
        name: 'Completing',
        label: 'Loading results…',
        resolve: true
    }];


    var Progress = function(uploadPromise, data) {
        var uploadProgressCombinedPromise = this.initPromises(uploadPromise);
        this.init(data);

        return uploadProgressCombinedPromise;
    };

    Progress.prototype.init = function(data) {
        this.CurrentStepID;
        this.KnobTimer;
        this.KnobProgress;
        this.knobSnapshot;
        this.ProgressSteps;
        this.StepTimer;

        this.$progress = $('#progressCanvas');
        this.$progressBar = this.$progress.find('.js-progress__bar');
        this.$progressBarKnob = this.$progressBar.find('.js-progress__bar-input');
        this.$progressBarValue = this.$progressBar.find('.js-progress__bar-value');
        this.$progressBarLabel = this.$progressBar.find('.js-progress__bar-label');
        this.$progressSteps = this.$progress.find('.js-progress__steps');

        this.reset();
        this.initKnob();
        this.setSteps(data);
        this.setKnobTimer();
        this.nextStep();
        this.pollToSlowDown();
    };

    Progress.prototype.initPromises = function(uploadPromise) {
        this.progressPromise = new Promise(function(resolve, reject) {
            this.progressPromiseResolve = resolve;
            this.progressPromiseReject = reject;
        }.bind(this));

        this.uploadPromise = uploadPromise;
        this.uploadPromise
            .then(function(response) {
                this.uploadPromiseResolved = true;
                if (!response || !response.success) {
                    if (response && response.error) {
                        this.interrupt('Scanning Error', response.error);
                    } else if (response) {
                        this.interrupt('Upload Error', response);
                    } else {
                        this.interrupt('Unknown Error', 'AccessFuel Engine did not respond');
                    }
                }
            }.bind(this)).fail(function(e) {
                this.interrupt('Unknown Error', e);
            }.bind(this));

        return Promise.all([this.uploadPromise, this.progressPromise]);
    };

    Progress.prototype.initKnob = function() {
        this.$progressBarKnob.knob({
            fgColor: '#4dbc72',
            readOnly: true,
            thickness: .025,
            height: 300,
            width: 300,
            step: 0.05
        });
    };

    Progress.prototype.reset = function() {
        this.CurrentStepID = null;
        this.knobSnapshot = false;
        this.ProgressSteps = [];
        this.StartTime = Date.now();

        this.setKnobValue(0);
        this.$progressBarLabel.empty();
        this.$progressSteps.empty();
    };

    Progress.prototype.interrupt = function(type, message) {
        window.clearTimeout(this.StepTimer);
        window.clearTimeout(this.KnobTimer);

        this.errorStep(type, message);
    }

    Progress.prototype.setSteps = function(data) {
        if (!data || !data.length) {
            return false;
        }

        this.ProgressSteps = data;

        // Render steps
        $.each(this.ProgressSteps, $.proxy(this.renderStep, this));
    };


    Progress.prototype.renderStep  = function(_, step) {
        step.$el = $('<p>', {
            'class': 'af-progress__step',
            html: step.name
        });

        step.$el.appendTo(this.$progressSteps);
    };

    Progress.prototype.errorStep = function(type, message) {
        if (this.CurrentStepID === null) {
            return false;
        }

        // Error styles for progress step
        var $currentStep = this.ProgressSteps[this.CurrentStepID].$el;
        $currentStep.removeClass('af--active').addClass('af--error');

        // Error styles for progress knob
        this.$progressBarKnob.trigger('configure', {
            fgColor: '#ff0000'
        });

        // Error message in progress knob
        this.$progressBarLabel.text(type + '…');

        // Error message in progress step
        var $error = $('#uploadProgressErrorTemplate').clone();
        $error.removeAttr('hidden');
        $error.find('.js-upload-progress-error-label').text(type);
        $error.find('.js-upload-progress-error-message').text(message);
        $error.appendTo($currentStep);
    };

    Progress.prototype.nextStep = function() {
        // Set previousstep as finished
        if (this.CurrentStepID !== null) {
            var $currentStep = this.ProgressSteps[this.CurrentStepID].$el;
            $currentStep.removeClass('af--active').addClass('af--complete');
        }

        if (this.CurrentStepID === null) {
            this.CurrentStepID = 0;
        } else if (this.CurrentStepID < this.ProgressSteps.length - 1) {
            this.CurrentStepID++;
        } else {
            return false;
        }

        var nextStep = this.ProgressSteps[this.CurrentStepID];

        // Set next step as active
        var $nextStep = nextStep.$el;
        $nextStep.addClass('af--active');
        this.$progressBarLabel.text(nextStep.label);


        // Set Timer
        this.setStepTimer(nextStep);
    };

    Progress.prototype.setStepTimer = function(step) {
        var _setStepTimer = function() {
            var stepDelay = step.delay ? step.delay * 1000 : 0;
            var stepTime = step.time ? step.time * 1000 : 0;

            if (Date.now() - step.startTime < stepTime) {
                this.StepTimer = window.setTimeout($.proxy(_setStepTimer, this), 500);
            } else {
                this.nextStep();

                if (step.resolve) {
                    // Resolve progress promise
                    if (stepDelay) {
                        window.setTimeout(this.progressPromiseResolve, stepDelay);
                    } else {
                        this.progressPromiseResolve();
                    }
                }
            }
        };

        // Set step timer
        step.startTime = Date.now();
        $.proxy(_setStepTimer, this)();
    };

    Progress.prototype.pollToSlowDown = function() {
         // Check if upload is finished
        if (!this.uploadPromiseResolved) {
            window.setTimeout(this.pollToSlowDown.bind(this), 2000);
            this.updateStepTimer(1);
        }
    };

    Progress.prototype.updateStepTimer = function(time) {
        var step = this.ProgressSteps[this.CurrentStepID];
        step.time = step.time + time;

        this.knobSnapshot = {
            time: Date.now(),
            progress: this.KnobProgress
        };

        console.log('Update current step for ' + time + 'seconds', this.ProgressSteps[this.CurrentStepID], this.knobSnapshot);
    };

    Progress.prototype.updateStepProgress = function(progress, time) {
        time = time ? time : 0;

        this.knobSnapshot = {
            time: Date.now(),
            progress: this.KnobProgress,
            target: {
                time: Date.now() + (time + 1) * 1000,
                progress: progress
            }
        };

        if (progress === 1) {
            this.ProgressSteps[this.CurrentStepID].time = 0;
        }
    };

    Progress.prototype.setKnobTimer = function() {

        var _knobCallback = function() {
            this.updateKnobProgress();

            if (this.KnobProgress < 1) {
                this.setKnobTimer();
            }
        };

        this.KnobTimer = window.setTimeout($.proxy(_knobCallback, this), 50);
    };


    Progress.prototype.updateKnobProgress = function() {
        var currentTime = Date.now();
        var step = this.ProgressSteps[this.CurrentStepID];

        var timersLength = 0;
        $.each(this.ProgressSteps, function(_, step) {
            if (step.time) {
                timersLength += step.time;
            }
        });

        var knobProgress = (currentTime - this.StartTime) / (timersLength * 1000);

        if (this.knobSnapshot) {
            var s = this.knobSnapshot;
            var t = this.knobSnapshot.target;

            if (t && t.time > currentTime) {
                knobProgress =  s.progress + (t.progress - s.progress) * (currentTime - s.time) / (t.time - s.time);
            } else if (!t) {
                knobProgress =  s.progress + (1 - s.progress) * (currentTime - s.time) / (timersLength * 1000 - (s.time - this.StartTime));
            }
        }

        this.setKnobValue(Math.min(Math.max(knobProgress, this.KnobProgress), 1));
    };

    Progress.prototype.setKnobValue = function(value) {
        this.KnobProgress = value;

        this.$progressBarKnob.val(this.KnobProgress * 100).trigger('change');;
        this.$progressBarValue.html(parseInt(this.KnobProgress * 100));
    };

    var init = function(uploadPromise) {
        var uploadProgress = new Progress(uploadPromise, DEFAULT_PROGRESS_DATA);
        return uploadProgress;
    };

    return init;
});