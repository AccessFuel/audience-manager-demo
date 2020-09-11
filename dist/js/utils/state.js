define(function (require) {
    var State = {
        get: function (key, defaultValue) {
            return localStorage.getItem('state.' + key) || defaultValue;
        },
        set: function (key, value) {
            return localStorage.setItem('state.' + key, value);
        }
    };

    return State;
});