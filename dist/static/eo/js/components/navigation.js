var NavigationUI = (function($, window) {
    var Navigation = function(callback) {
        this.init(callback);
    };

    Navigation.prototype.init = function(callback) {
        this.currentStep;
        this.callback = callback; // global callback
        this.$steps = $('.js-navigation-step');
    };

    Navigation.prototype.navigate = function(step, callback) {
        var $activeStep = this.$steps.filter('.js-navigation-step__' + step);

        if (!$activeStep.length) {
            return false;
        }

        this.currentStep = step;

        // Toggle steps
        this.$steps.prop('hidden', true);
        $activeStep.prop('hidden', false);

        window.scrollTo(0, 0);

        // Call current step init callback
        if (callback) {
            callback(step);
        } else if (this.callback) {
            this.callback(step);
        }
    }


    return Navigation;
})(jQuery, window);