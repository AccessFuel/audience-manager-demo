define(function (require) {
    var $ = require('jquery');
    var SweetAlert = require('sweetAlert');

    var AdminAPI = require('adminAPI');

    // Canned demo
    var State = require('state');

    // Template scripts
    require('inspinia');
    require('slick');

    const $commonLoader = $('<div>', {
        class: 'af-loader af--page',
        html: '<i class="fa fa-circle-o-notch fa-spin fa-5x af-brand-color" />',
    });

    var _bindConnectEventbride = function() {
        $('body').on('click', '.js-beta', function() {
            swal({
                title: '<h3>This feature is currently in beta testing mode.</h3>',
                text: 'Please contact us if you’d like to participate in our limited group testing initiative and try new features before they are officially released:<br/><br/><big><i class="fa fa-phone"></i> 323 844 3839</big>',
                html: true,
                confirmButtonText: "Close",
                closeOnConfirm: true
            }, function () {
                // TODO
            });
        });
    };

    const _bindCopyOnClick = () => $('body')
        .on('click', '.js-copy-click', function () {
            const animationClasses = 'animated pulse';
            const $container = $(this);
            const $input = $('<input />')
            const text = $container.text().replace(/[ ]+/g, ' ');
            $input.val(text).appendTo('body');
            $input.get(0).select();
            $input.get(0).setSelectionRange(0, 99999);
            document.execCommand("copy");
            $input.remove();
            $container.addClass(animationClasses);
            setTimeout(() => $container.removeClass(animationClasses), 300);
        })

    var _bindEnhanceRequest = function() {
        $('body').on('initEnhanceRequest', function() {
            $('.js-enhance-request-form').each(function(_, form) {
                var $form = $(form);
                var $checkboxes = $form.find('fieldset ul input[type="checkbox"][name*="data-points"]');
                var $groups = $form.find('input[type="checkbox"].js-enhance-request-group');
                var $selectAll = $form.find('input[type="checkbox"].js-enhance-request-select-all');

                var setAllSelected = function() {
                    var allSelected = $checkboxes.filter(function() {
                        return !$(this).prop('checked');
                    }).length === 0;
                    $selectAll.prop('checked', allSelected);
                };

                var setCTAState = function() {
                    var anySelected = $checkboxes.filter(function() {
                        return $(this).prop('checked');
                    }).length > 0;

                    $('.js-enhance-request-submit').prop('disabled', !anySelected);
                };

                var setGroupSelected = function($group) {
                    var allGroupSelected = $group.find('ul input[type="checkbox"]').filter(function() {
                        return !$(this).prop('checked');
                    }).length === 0;
                    $group.find('.js-enhance-request-group').prop('checked', allGroupSelected);
                };

                $groups.on('change', function() {
                    var $input = $(this);
                    var $group = $input.closest('fieldset');

                    $group.find('ul input[type="checkbox"]').prop('checked', $input.prop('checked'));
                    setAllSelected();
                    setCTAState();
                });

                $selectAll.on('change', function() {
                    var $input = $(this);
                    $checkboxes
                        .add($groups)
                        .not('.js-enhance-request-select-all')
                        .prop('checked', $input.prop('checked'));
                    setCTAState();
                });

                $checkboxes.on('change', function() {
                    var $input = $(this);
                    var $group = $input.closest('fieldset');

                    setGroupSelected($group);
                    setAllSelected();
                    setCTAState();
                });

                $form.on('click', '.js-enhance-request-submit', function(e) {
                    e.preventDefault();
                    var $sources = $form.find('[name*="data-sources"]:checked');
                    var $customSources = $form.find('[name="data-source-custom"]');
                    var $attributes = $form.find('[name*="data-points"]:checked');
                    var $eventName = $form.find('[name="evantName"]');

                    var attributes = $.map($attributes, function(input) {
                        return $(input).val();
                    });
                    var sources = $.map($sources, function(input) {
                        return $(input).val();
                    });
                    var data = {
                        'Attributes': attributes,
                        'Sources': sources,
                        'Custom Sources': $customSources.val(),
                        'EventName': $eventName.val()
                    };

                    return Promise
                        .resolve(AdminAPI.notify('Enhancement Request', 'User Requested File Enhancement', data))
                        .then(function() {
                            swal({
                                title: 'Data Verification & Enrichment Request Sent',
                                text: 'Your request has been sent to our partners. You will receive a notification once it is complete.',
                                html: true,
                                confirmButtonText: "Done",
                                closeOnConfirm: true
                            }, function () {
                                // TODO
                            });
                        }).catch(function(e) {
                            swal({
                                title: 'Something went wrong.',
                                text: 'We could not connect to the notification server. Please reload the page and try again.',
                                html: true,
                                confirmButtonText: "Close",
                                closeOnConfirm: true
                            }, function () {
                                // TODO
                            });
                        });
                });
            });
        });
    };

    var _bindRemoteModal = function() {
        var $modal = $('#remoteModal');
        var $container = $modal.find('.modal-content');
        var $loader = $('<div>', {
            class: 'modal-body',
        }).append($commonLoader.clone());

        $('body').on('click', '[data-target="#remoteModal"][data-content]', function() {
            $container.empty().append($loader);
            var contentURL = $(this).data('content');

            window.setTimeout(function() {
                // Initialize content carousel
                $container.load(contentURL, function() {
                    $container.find('.js-carousel').slick({
                        infinite: false,
                        speed: 100,
                    });

                    $container.data('loaded', true);
                });
            }, 700);
        });
    };

    const _bindIndustry = () => {
        $('body').on('click', '[data-industry]', function() {
            const industry = $(this).data('industry');
            console.log('Setting industry', industry);
            State.set('industry', industry);
        });

        const industry = State.get('industry', 'events');
        $(`[data-industry="${industry}"]`).addClass('af--active');
        
        setInterval(() => {    
            $(`[data-industry-only]`)
                .hide()
                .filter(`[data-industry-only="${industry}"]`)
                .show();
        }, 50);
    }

    var _bindLogout = function() {
        $('.js-logout').on('click', function(e) {
            State.set('isAuthorized', false);
            State.set('hasFiles', false);
        });
    }

    var _bindTabs = function() {
        const showTab = ($tab) => {
            // Ajax loader
            if ($tab.data('toggle') === 'ajaxTab') {
                const loadurl = $tab.attr('href');
                const target = $tab.data('target');
                const $target = $(target);
                
                // Show loader
                $target.empty().append($commonLoader.clone());
                
                setTimeout(() => $.get(loadurl, function(data) {
                    $target.html(data);
                }), 100);
            }

            $tab.tab('show');
        }

        $('.nav-tabs a').on('click', function (e) {
            e.preventDefault();
            showTab($(this));
        });

        $('.nav-tabs').each((_, tabset) => {
            showTab($(tabset).find('.nav-item a').first())
        });
    }

    var _isLogin = function() {
        if (!State.get('isAuthorized')) {
            window.location.href = "./login.html";
        }
    };

    var init = function() {
        _isLogin();
        _bindCopyOnClick();
        _bindConnectEventbride();
        _bindEnhanceRequest();
        _bindIndustry();
        _bindRemoteModal();
        _bindLogout();
        _bindTabs();
    };

    init();
});