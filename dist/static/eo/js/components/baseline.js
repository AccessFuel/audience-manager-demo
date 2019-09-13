var BaselineUI = (function($, window) {
    var Baseline = function(data) {
        this.init(data);
    };

    Baseline.prototype.init = function(data) {

        if (!data) {
            return false;
        }

        this.Data = {};
        this.Attributes = ['company', 'age', 'gender', 'title', 'location', 'email', 'name', 'e-mail'];
        this.Widgets = ['statsAttendees', 'statsDuplicates', 'statsMatches', 'statsCompletion'];
        this.Fields = ['fieldsMatched', 'fieldsUnmatched', 'fieldsEnhance'];
        this.Extras = ['Gender', 'Age', 'Race', 'Location', 'Education', 'Skills', 'Twitter'];

        this.parseData(data);

        this.renderWidgets();
        this.renderBaseline();
    };

    Baseline.prototype.parseData = function(data) {
        if (!data || !data['sheets'] || !data['sheets'][0]) {
            // TODO: Report data error
            return false;
        }

        // TODO: should come from API as a parameter for each field
        // as oposed to comparing vs. Attributes list on front-end
        var sortFields = function(_, field) {
            for (var attr in this.Attributes) {
                if (field.Column.toLowerCase().indexOf(this.Attributes[attr]) > -1) {
                    this.Data.matchedFields.push(field);
                    return;
                }
            }

            this.Data.unmatchedFields.push(field);
        };

        var calculateCompletion = function() {
            var totalCompletion = 0;
            $.each(this.Data.matchedFields, function(_, field) {
                totalCompletion += field['Complete %'];
            });

            return this._convertToPercent(totalCompletion / this.Data.matchedFields.length);
        };


        this.Data.souce = data['sheets'][0];
        this.Data.uniqueRows = this.Data.souce['sheet_rows'] || 0;
        this.Data.duplicateRows = this.Data.souce['sheet_duplicate'] || 0;
        this.Data.totalRows = this.Data.uniqueRows + this.Data.duplicateRows;

        this.Data.allFields = this.Data.souce['sheet_report'];
        this.Data.matchedFields = [];
        this.Data.unmatchedFields = [];
        this.Data.enhanceFields = this.Extras.map(function(extra) {
            return {
                Column: extra
            };
        });

        $.each(this.Data.allFields, $.proxy(sortFields, this));

        this.Data.reportCompletion = $.proxy(calculateCompletion, this)();
    }


    Baseline.prototype.renderWidgets = function() {
        var setWidget = function(_, widgetID) {
            switch(widgetID) {
                default:
                    return;
                case 'statsAttendees':
                    new WidgetUI(widgetID, [this.Data.uniqueRows, this.Data.totalRows]);
                    break;
                case 'statsDuplicates':
                    new WidgetUI(widgetID, [this.Data.duplicateRows, this.Data.totalRows]);
                    break;
                case 'statsMatches':
                    var knobData = {
                        value: this.Data.matchedFields.length,
                        total: this.Data.allFields.length
                    };

                    new WidgetUI(widgetID, [knobData]);
                    break;
                case 'statsCompletion':
                    new WidgetUI(widgetID, [this.Data.reportCompletion]);
                    break;
            }
        };

        $.each(this.Widgets, $.proxy(setWidget, this));
    };

    Baseline.prototype.renderBaseline = function() {
        var setFields = function(_, listID) {
            switch(listID) {
                default:
                    return false;
                    break;
                case 'fieldsMatched':
                    this.updateFields(listID, [this.Data.matchedFields]);
                    break;
                case 'fieldsUnmatched':
                    this.updateFields(listID, [this.Data.unmatchedFields]);
                    break;
                case 'fieldsEnhance':
                    this.updateFields(listID, [this.Data.enhanceFields]);
                    break;
            }
        };

        $.each(this.Fields, $.proxy(setFields, this));
    };

    Baseline.prototype.updateFields = function(listID, data) {
        var $fieldsList = $('#' + listID);

        if (!$fieldsList.length) {
            return;
        }

        $fieldsList.empty();

        var renderField = function(_, field) {
            var $field = $('<li>', {
                class: 'af-list__item'
            });
            var fieldCompletion = this._convertToPercent(field['Complete %']);
            var cssModifiers = '';

            if (fieldCompletion < 33) {
                cssModifiers = 'af--poor';
            } else if (fieldCompletion < 66) {
                cssModifiers = 'af--avg';
            } else {
                cssModifiers = 'af--good';
            }

            $field.html(field.Column);

            switch (listID) {
                case 'fieldsMatched':
                    $field.prepend('<i class="fa fa-check af-brand-color"></i>');
                    $field.prepend('<span class="label af-label af--quality ' + cssModifiers + '">' + fieldCompletion + '</span>');
                    break;
                case 'fieldsUnmatched':
                    $field.prepend('<span class="label af-label af--quality ' + cssModifiers + '">' + fieldCompletion + '</span>');
                    break;
                case 'fieldsEnhance':
                    $field.prepend('<input type="checkbox" class="js-enhance-field-select" />');
                    $field.wrapInner('<label class="u-text-pale">');
                    break;
            }

            $field.appendTo($fieldsList);
        };

        $.each(data[0], $.proxy(renderField, this));

        // Collapse long Unmatched fields list
        if (listID === 'fieldsUnmatched' && data[0].length > 7) {
            var $expandListControl = $('<a>', {
                class: 'u-text-xsmall js-all-lists-toggle js--show',
                html: '<i class="fa fa-chevron-down u-margin-right-md"></i>View All'
            });

            var $collapseListControl = $('<a>', {
                class: 'u-text-xsmall js-all-lists-toggle js--hide',
                html: '<i class="fa fa-chevron-up u-margin-right-md"></i>Hide All'
            });

            $fieldsList.append($('<li class="text-center">').append($expandListControl).append($collapseListControl));

            $('.js-all-lists-toggle').on('click', function() {
                var show = $(this).hasClass('js--show');
                var $list = $(this).closest('.af-list');

                $expandListControl.prop('hidden', show);
                $collapseListControl.prop('hidden', !show);

                $list.toggleClass('af--collapsed', !show);
            });

            $collapseListControl.trigger('click');
        }
    };

    Baseline.prototype._convertToPercent = function(val) {
        return (100 * val).toFixed(0);
    };


    return Baseline;
})(jQuery, window);