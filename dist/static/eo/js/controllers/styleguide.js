(function($, window) {
    $(function() {
        var reportsUI = new ReportsUI();

        if (!reportsUI) {
            return false;
        }

        // Company Report
        // -------------
        $.ajax({
            url: 'data/styleguide/company.json',
            dataType: 'json',
            success: function(data) {
                reportsUI.companyReport($('.js-report-company'), data);
            }
        });

        // Education Report
        // ----------------
        $.ajax({
            url: 'data/styleguide/education.json',
            dataType: 'json',
            success: function(data) {
                reportsUI.educationReport($('.js-report-education'), data);
            }
        });

        // Skills Report
        // -------------
        $.ajax({
            url: 'https://api.accessfuel.com/job_results/54cb7b16-59f4-4c50-9b8a-062a6d788e73/JSON/skills__name',
            dataType: 'json',
            success: function(data) {
                reportsUI.skillsReport($('.js-report-skills'), data);
            }
        });
    });
})(jQuery, window);