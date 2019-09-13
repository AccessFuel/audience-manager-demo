var UploadUI = (function($, window) {
    var Upload = function(callback) {
        this.init(callback);
    };

    Upload.prototype.init = function(callback) {
        this.uploadCalback = callback;

        this.$form = $('#uploadForm');
        this.$inputFile = this.$form.find('input[type="file"]');

        this.bindHandlers();
    };

    Upload.prototype.bindHandlers = function() {
        var self = this;

        // Delegate click event for Select File buttons
        this.$form.on('click', 'button', function(e) {
            e.preventDefault();
            self.$inputFile.click();
        });

        // Immediately start uppload when file is dropped
        this.$form.on('change', 'input[type="file"]', function(e) {
            self.uploadCalback(this.files[0]);
        });
    };

    return Upload;
})(jQuery, window);