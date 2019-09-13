define(function (require) {
    var _sortItems = function($items, sortAttribute, sortAsscending) {
        return $items.sort(function(a, b) {
            var aSort = $(a).data(sortAttribute);
            var bSort = $(b).data(sortAttribute);

            if (!aSort || !bSort) {
                return 0;
            } else if (isNaN(aSort) || isNaN(bSort)) {
                return sortAsscending ? (aSort.toLowerCase() < bSort.toLowerCase()) : (aSort.toLowerCase() > bSort.toLowerCase());
            } else {
                return sortAsscending ? aSort - bSort : bSort - aSort;
            }
        });
    };

    var _bindHandlers = function($container) {
        $container.on('click', '.js-sort-toggle', function() {
            var $toggle = $(this);
            var sortAsscending = $toggle.hasClass('af--desc');
            var sortAttribute = $toggle.data('sort');

            var $toggles = $container.find('.js-sort-toggle');
            var $list = $container.find('.js-sort-list');
            var $items = $list.find('.js-sort-item');

            if (!$items.length) {
                return
            }

            var $sortedItems = _sortItems($items, sortAttribute, sortAsscending);
            $list.append($sortedItems);

            $toggles.removeClass('af--active').removeClass('af--asc').removeClass('af--desc');
            $toggle.addClass('af--active').addClass(sortAsscending ? 'af--asc' : 'af--desc');
        });
    };

    var init = function($context) {
        if (!$context || !$context.length) {
            return;
        }

        $context.each(function(_, container) {
            _bindHandlers($(container));
        });
    };


    return init;
});