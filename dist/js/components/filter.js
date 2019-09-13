define(function (require) {

    var _parseFormData = function($form) {
        return $form
            .serializeArray()
            .map(function(v) {
                return {
                    key: v.name,
                    value: v.value
                };
            });
    };
    var _updateFilters = function($list, data) {
        var $items = $list.find('.js-files-list-item');
        var $filteredItems = $items;
        var $noItems = $list.find('.js-filter-no-results');

        $.each(data, function(_, filter) {
            $filteredItems = $filteredItems.filter(function() {
                var $filterElement = $(this).find('[data-filter="' + filter.key + '"]');
                var filterMatch = $filterElement.length && $filterElement.text().toLowerCase().match(filter.value.toLowerCase());
                return !$filterElement.length || filterMatch;
            });
        });

        $items.prop('hidden', true);
        $filteredItems.prop('hidden', false);
        $noItems.prop('hidden', $filteredItems.length > 0);

        updateHeader($items.length, $filteredItems.length);
    };

    var _bindHandlers = function($list) {
        var $form = $list.find('.js-filter-form');
        var $inputs = $form.find('.js-filter-input');

        var _filterUpdateCallback = function() {
            var data = _parseFormData($form);
            _updateFilters($list, data);
        };

        // Bind filters update
        $list.on('change input', '.js-filter-input', _filterUpdateCallback);

        // Bind filters reset
        $list.on('click', '.js-filter-reset', function() {
            $form.get(0).reset();
            _filterUpdateCallback();
        });
    };

    var updateHeader = function(itemsLength, filteredLength) {
        if (itemsLength === filteredLength) {
            $('.js-files-title-filtered').prop('hidden', true);
            $('.js-files-title-all').prop('hidden', false);
        } else {
            $('.js-files-title-filtered').prop('hidden', false);
            $('.js-files-title-all').prop('hidden', true);
            $('.js-files-title-filtered-count').text(filteredLength);
        }
    };

    var init = function($list) {
        if (!$list || !$list.length) {
            return;
        }

        _bindHandlers($list);
    };


    return init;
});