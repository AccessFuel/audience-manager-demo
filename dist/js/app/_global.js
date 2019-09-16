define(function (require) {
    var $ = require('jquery');
    var SweetAlert = require('sweetAlert');

    var AdminAPI = require('adminAPI');

    // Canned demo
    var State = require('state');

    // Template scripts
    require('inspinia');
    require('slick');

    var _bindConnectEventbride = function() {
        $('body').on('click', '.js-connect-eventbrite', function() {
            swal({
                title: '<img src="./dist/images/logo/eventbrite-logo.png" alt="Eventbrite" title="Connect to Eventbrite" height="60" /><br/><small>This feature is currently in beta testing mode.</small>',
                text: 'Please contact us if you’d like to participate in our limited group testing initiative and try new features before they are officially released:<br/><br/><big><i class="fa fa-phone"></i> 323 844 3839</big>',
                html: true,
                confirmButtonText: "Close",
                closeOnConfirm: true
            }, function () {
                // TODO
            });
        });
    };

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
                                title: 'Enhancement Request is Sent',
                                text: 'Our editors will analyze your initial audience report and suggest several options to acquire meaningful in-depth insights for your event.',
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
            html: '<div class="af-loader af--page"><i class="fa fa-circle-o-notch fa-spin fa-5x af-brand-color" /></div>',
        });

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

    var _bindLogout = function() {
        $('.js-logout').on('click', function(e) {
            State.set('isAuthorized', false);
            State.set('hasFiles', false);
        });
    }

    var _isLogin = function() {
        if (!State.get('isAuthorized')) {
            window.location.href = "./login.html";
        }
    };

    var init = function() {
        _isLogin();
        _bindConnectEventbride();
        _bindEnhanceRequest();
        _bindRemoteModal();
        _bindLogout();
    };

    init();
});