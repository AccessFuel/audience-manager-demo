var KnobUI = (function($, window) {
    var Knob = function($knob, data, params) {
        this.Classes = {
            component: 'af-knob',
            inner: 'af-knob__inner',
            input: 'af-knob__input',
            label: 'af-knob__label',
            legend: 'af-knob__legend',
            value: 'af-knob__value',
        };

        var defaultParams = {
            fgColor: 'white',
            bgColor: 'rgba(255,255,255,0.25)',
            readOnly: true,
            thickness: .075,
            height: 150,
            width: 150,
            displayInput: false,
            lineCap: 'round',
            max: 1
        };

        this.$knob = $knob;
        this.Data = data;
        this.Params = $.extend({}, defaultParams, params || {});

        if (!this.$knob.length || !this.Data) {
            return false;
        }

        return this.init();
    };

    Knob.prototype.init = function() {
        this.Format = this.$knob.data('knob-format') || 'text';
        this.KnobValue = this.Data.value;

        this.calculateKnobValue();
        this.create();
        this.draw();

        return this.$knob;
    };

    Knob.prototype.calculateKnobValue = function() {
        switch (this.Format) {
            default:
            case 'text':
                this.KnobValue = this.Data.value / 100;
                break;
            case 'share':
                this.KnobValue = this.Data.value / this.Data.total;
        }
    }

    Knob.prototype.create = function() {
        this.$inner = $('<div>', {class: this.Classes.inner});
        this.$input = $('<input>', {class: this.Classes.input});
        this.$value = $('<label>', {class: this.Classes.value});
        this.$label = $('<label>', {class: this.Classes.label});

        // Input
        // -----
        this.$input
            .val(this.KnobValue)
            .prop('hidden', true)
            .appendTo(this.$inner);

        // Value
        // -----
        if (this.Data.value !== false) {
            this.$value
                .html(Utils.formatDataByType([this.Data.value, this.Data.total], this.Format))
                .addClass('af-data')
                .addClass('af--' + this.Format)
                .appendTo(this.$inner);
        } else {
            this.$knob.addClass('af--empty');
        }

        // Label
        // -----
        this.$label
            .text(this.Data.label || this.$knob.data('knob-label'))
            .appendTo(this.$inner);

        this.$knob
            .empty()
            .append(this.$inner);

        // Legend
        // ------
        if (this.Data.legend) {
            $('<legend>', {
                class: this.Classes.legend,
                text: this.Data.legend
            }).appendTo(this.$knob);
        }

        // Link
        // ------
        if (this.Data.link) {
            this.Params.bgColor = '#43b8c8';
            this.$knob.wrapInner($('<a>', {
                class: 'af-knob__link',
                href: this.Data.link
            }));
        }
    };

    // Init Knob
    Knob.prototype.draw = function() {
        this.$input
            .knob(this.Params);
    };


    return Knob;
})(jQuery, window);