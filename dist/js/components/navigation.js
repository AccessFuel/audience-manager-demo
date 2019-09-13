define(function (require) {

    var _getScope = function(scope) {
        return scope ? $('[data-navigation-scope="' + scope + '"]') : $('body');
    }

    var _toggleStep = function(currentStep, scope, param) {
        var $scope = _getScope(scope);

        if (!$scope.length) {
            return;
        }

        var $steps = $scope.find('[data-navigation]');
        var $currentStep = $steps.filter(function() {
            var _steps = $(this).data('navigation').replace(/[\s]+/g,'').split(',');
            return _steps.indexOf(currentStep) >= 0;
        });

        if (!$currentStep.length) {
            return;
        }

        // Toggle steps
        if (param.hideOthers) {
            $steps.prop('hidden', true);
            window.scrollTo(0, 0);
        }

        $currentStep.prop('hidden', !param.toggle);
    };

    // Toggle active step on and all other steps off
    var toggle = function(currentStep, scope) {
        _toggleStep(currentStep, scope, {
            toggle: true,
            hideOthers: true
        });
    };

    // Show step without hiding others
    var add = function(currentStep, scope) {
        _toggleStep(currentStep, scope, {
            toggle: true,
            hideOthers: false
        });
    };

    // Show step without hiding others
    var hide = function(currentStep, scope) {
        _toggleStep(currentStep, scope, {
            toggle: false
        });
    };

    return {
        navigate: toggle,
        add: add,
        hide: hide
    };
});