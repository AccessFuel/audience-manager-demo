define(function (require) {
    var SAMPLE_FILE_DATA = "SampleFile";

    var _decorateDragOver = function($form, toggle) {
        // Execute in another thread to prevent immediate dragleave event
        window.setTimeout(function() {
            $form.toggleClass('af--dropover', toggle);

            if (toggle) {
                window.clearTimeout(window.uploaderDropTimeout);
                window.uploaderDropTimeout = window.setTimeout(function() {
                    _decorateDragOver($form, false);
                }, 500);
            }
        });
    };

     var _bindHandlers = function($form, callback) {
        var $document = $('html');
        var $inputFile = $form.find('input[type="file"]');
        var $inputUseSampleDataFile = $form.find('#useSampleDataFile');

        // Delegate click event for Select File buttons
        $document.on('click', '.js-upload-trigger', function(e) {
            e.preventDefault();
            $inputFile.click();
        });

        $document.on('dragover', function(e) {
            console.log('>> dragover');
            e.preventDefault();
            _decorateDragOver($form, true);
        });

        $document.on('dragleave', function(e) {
            console.log('>> dragleave');
            e.preventDefault();
            _decorateDragOver($form, false);
        })

        $document.on('drop', function(e) {
            console.log('>> drop');
            var useSampleDataFile = !!e.originalEvent.dataTransfer.getData(SAMPLE_FILE_DATA);
            $inputUseSampleDataFile.val(useSampleDataFile);

            if(useSampleDataFile) {
                $form.submit();
            }
        });

        if (callback) {
            $form.on('submit', function(e) {
                e.preventDefault();
                callback($inputFile.get(0).files[0], $inputUseSampleDataFile.val() === 'true');

                // Ensure correct form behavior when navigating back
                setTimeout(function() {
                    $form.get(0).reset();
                });
            });
        }

        // Immediately start uppload when file is dropped
        $inputFile.on('change', function(e) {
            $form.submit();
        });
    };

    var _bindSampleFile = function($form) {
        var $sampleFileDraggable = $('.js-sample-file');

        $sampleFileDraggable
            .on('dragstart', function(e) {
                $(this).addClass('af--dragging');
                e.originalEvent.dataTransfer.setData(SAMPLE_FILE_DATA, true);
                setTimeout(function() {
                    _decorateDragOver($form, true);
                });
            })
            .on('dragend', function(e) {
                $(this).removeClass('af--dragging');
                e.originalEvent.dataTransfer.setData(SAMPLE_FILE_DATA, false);
            });
    };

    var init = function($form, callback) {
        if (!$form || !$form.length) {
            return;
        }

        _bindHandlers($form, callback);
        _bindSampleFile($form);
    };


    return init;
});