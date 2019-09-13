var ProgressUI = (function($, window) {
    var Progress = function(data) {
        this.init(data);
    };

    Progress.prototype.init = function(data) {
        this.CurrentStepID;

        this.StepTimer;
        this.KnobTimer;
        this.KnobProgress;
        this.knobSnapshot;

        this.ProgressSteps;

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
    };

    Progress.prototype.initKnob = function() {
        this.$progressBarKnob.knob({
            fgColor: '#4dbc72',
            readOnly: true,
            thickness: .05,
            height: 300,
            width: 300,
            step: 0.1
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
        var $currentStep = this.ProgressSteps[this.CurrentStepID].$el;
        $currentStep.removeClass('af--active').addClass('af--error');

        var $error = $('<p>', {
            class: 'af-error',
            html: type + ': ' + message
        });

        var $errorCTR = $('<a>', {
            href: "",
            text: 'Try again'
        })

        $error
            .append($errorCTR)
            .appendTo($currentStep);

        this.$progressBarLabel.text(type + '…');
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

                if (step.callback) {
                    // Execute step callback with a delay if set
                    window.setTimeout(step.callback, stepDelay);
                }
            }
        };

        // Set step timer
        step.startTime = Date.now();
        $.proxy(_setStepTimer, this)();
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


    return Progress;
})(jQuery, window);