var WidgetUI = (function($, window) {
    var Widget = function(widgetID, data, params) {
        this.WidgetID = widgetID;
        this.Data = data;
        this.Params = params;

        return this.init();
    };

    Widget.prototype.init = function() {
        this.$widget = $('[data-widget="' + this.WidgetID + '"]');
        this.$widgetFields = this.$widget.find('[data-widget-field]');
        this.$widgetKnobs = this.$widget.find('[data-widget-knob]');

        if (!this.$widget.length) {
            return false;
        }

        // Value
        // -----
        if (this.$widgetFields.length) {
            $.each(this.Data, $.proxy(function(i, data) {
                this.$widgetFields.filter(function() {
                    return $(this).data('widget-field') === i;
                }).html(Utils.formatNumber(data));
            }, this));
        }

        // Knob
        // ----
        if (this.$widgetKnobs.length) {
            $.each(this.Data, $.proxy(function(i, data) {
                var $knob = this.$widgetKnobs.filter(function() {
                    return $(this).data('widget-knob') === i;
                });

                if ($knob.length) {
                    new KnobUI($knob, data, this.Params);
                }
            }, this));
        }

        return this.$widget;
    };

    return Widget;
})(jQuery, window);