define(function (require) {
    const className = 'af-connect-services';
    const containerClassName = 'js-connect-services-ui';
    const logosPath = '/crm/images/logos/';
    const platformsDataUrl = '/dist/static/data/connect-services.json';
    const storageKey = 'AccessFuel:ConnectedPLatforms';

    const getConnectedPlatforms = () => {
        const connectedPlatformsStorage = localStorage.getItem(storageKey);
        const connectedPlatforms = connectedPlatformsStorage ? JSON.parse(connectedPlatformsStorage) : [];
        return connectedPlatforms;
    };

    const setConnectedPlatforms = (connectedPlatforms) => {
        const connectedPlatformsStorage = localStorage.setItem(storageKey, JSON.stringify(connectedPlatforms));
    };

    const toggleConnectedPlatform = (e, platform) => {
        const connectedPlatforms = getConnectedPlatforms();

        if (connectedPlatforms.includes(platform)) {
            e.stopImmediatePropagation();
            swal({
                title: 'Are you sure?',
                text: `You are about to disconnect from ${platform}. All your ${platform} data will be removed from AccessFuel.`,
                html: true,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: `Disconnect from ${platform}`,
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, () => {
                connectedPlatforms.splice( $.inArray(platform, connectedPlatforms), 1 );
                setConnectedPlatforms(connectedPlatforms);
                $('.modal').modal('hide');
                swal.close();
            });
        } else {
            const connectedPlatforms = getConnectedPlatforms();
            connectedPlatforms.push(platform);
            setConnectedPlatforms(connectedPlatforms);
        }
    };

    const filterPlatforms = (filter, $container) => {
        const $items = $container.find(`.${containerClassName}_item`);
        $items.each((_, item) => {
            const $item = $(item);
            const isVisible = $item.data('filter').match(filter);
            $item.prop('hidden', !isVisible);
        });

        // toggle empty categories visibility
        const $categories = $container.find(`.${containerClassName}_category`);
        $categories.each((_, category) => {
            const $category = $(category);
            const $items = $category.find(`.${containerClassName}_item`);
            const isVisible = $items.filter(':not([hidden])').length > 0;
            $category.prop('hidden', !isVisible);
        });
    }

    const renderFilter = ($container) => {
        const $filter = $('<form>', { class: `${className}__filter`});
        const $input = $('<input>', { 
            class: `${className}__filterInput`,
            placeholder: 'Search platforms…',
            type: 'text',
        });

        $input.on('change input', (e) => filterPlatforms(e.target.value.toLowerCase(), $container));

        return $filter.append($input);
    };

    const renderPlatform = ({ 
        link, 
        logo,
        modal, 
        name, 
        type, 
    }) => {
        const isConnected = getConnectedPlatforms().includes(name);
        const $platform = $('<li>', { class: `${className}__item ${containerClassName}_item` });
        const $logo = $('<div>', { class: `${className}__logo` });
        const $cta = $('<a>', { 
            class: `${className}__cta`,
            href: '#',
            text: name, 
            type: 'button',
        });

        if (isConnected) {
            $platform.addClass('af--connected');
            $cta
                .attr('data-content', modal)
                .attr('data-target', '#remoteModal')
                .attr('data-toggle', 'modal');
        } else {
            if (link || modal) {
                if (link) {
                    $cta
                        .attr('href', link)
                        .attr('target', '_blank');
                }
                if (modal) {
                    $cta
                        .attr('data-content', modal)
                        .attr('data-target', '#remoteModal')
                        .attr('data-toggle', 'modal');
                }
            } else {
                $platform.addClass('af--beta js-sample-connect');
                $cta.on('click', (e) => $('.modal').modal('hide'));
            }
        }

        $cta.on('click', (e) => toggleConnectedPlatform(e, name));


        // Add data for filtering
        $platform.data('filter', name.toLowerCase());

        if (logo) {
            const src = `${logosPath}${logo}`;
            const $image = $('<img>', { alt: name, src });
            $logo.append($image);
        }
            
        return $platform
            .append($logo)
            .append($cta);
    };
    
    const renderPlatformsList = (platforms) => {
        const $list = $('<ul>', { class: `${className}__platforms` });
        const $items = platforms.map(renderPlatform);
        return $list.append($items);
    };

    const renderCategories = (categories, platforms) => categories.map(({ name, type }) => {
        const categoryPlatforms = platforms.filter(platform => platform.type.includes(type));

        if (!categoryPlatforms.length) {
            return null;
        }

        const $category = $('<div>', { class: `${className}__category ${containerClassName}_category`});
        const $categoryTitle = $('<h4>', { class: `${className}__categoryTitle`, text: name })

        return $category
            .append($categoryTitle)
            .append(renderPlatformsList(categoryPlatforms));
    }).filter(e => !!e);

    const renderUI = (data = {}) => {
        const $container = $(`.${containerClassName}`);
        const { categories, platforms } = data;
        
        $container
            .empty()
            .append(renderFilter($container))
            .append(renderCategories(categories, platforms));
    };

    const loadUI = () => $.get(platformsDataUrl, renderUI);

    return () => {
        if (!window.loadConnectUI) {
            window.connectServicesUI = loadUI;
        }
    };
});
