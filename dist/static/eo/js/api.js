// $(document).ready(function (e) {
//     $("#uploadForm").on('change',(function(e) {
var accessfuel_api = "https://api.accessfuel.com/";
var file_id;
var job_id;
var reportsUI;
$(document).ready(function (e) {
    reportsUI = new ReportsUI();

    if (!reportsUI) {
        return false;
    }

    var inputKey = getParameterByName("job");

    if (inputKey !== null && inputKey != "") {
        job_id = inputKey;
        move_to_results();
    }

    $("#file").on('change', function (e) {
        $("#uploadFormP").html('<br><i class="fa fa-spinner fa-spin fa-3x"></i>');
        var data = new FormData();
        data.append('file', this.files[0]);
        ajax_it('upload', 'POST', data, upload_results);
    })
})

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function ajax_it(endpoint, type, data, to_do){
    $.ajax({
            url: accessfuel_api + endpoint,
            type: type,
            data:  data,
            contentType: false,
            cache: false,
            processData:false,
            success: function(data){
                to_do(data);
            }
       })
}

function start_enhancement(){
    $("#btn_enhance").prop("disabled", true);
    $("#btn_enhance").hide();

    $.ajax({
        url: accessfuel_api + 'start_job/' + file_id + '/local',
        type: 'GET',
        success: function(data) {
            get_job_id(data);
        }
    });
}

function enhancement_next(){
    $("#btn_next").prop("disabled", true);
    $("#btn_next").hide();
    $("#div_stats").hide();
    $("#div_stats_enhanced").show();

}

var poll_errors = 0;
function enhance_data_poll() {

try{
    if (job_id.length > 10){
        $.ajax({
            url: accessfuel_api + 'job_status/' + job_id,
            type: 'GET',
            dataType: 'json',
            success: function(data) {

                if ('details' in data){

                }
                else{
                    console.log('results not in yet...');
                    enhance_data_poll();
                }
                // data_here = JSON.parse(data_raw);
                details = data.details;
                total = details.total_items;
                completed = data.total_items_completed;
                console.log(total + ' - ' + completed);
                progress_val = (100 * parseFloat(completed) / total).toFixed(0);

                if (total != completed){
                    $("#progress_bar_value").attr('style', 'width:' + progress_val + '%');
                    // $("#btn_enhance").attr('value', progress_val + '%');
                    $("#div_pct").text(progress_val + '%');

                    if (progress_val>=50 & progress_val<70){
                        $("#icon_1_1").hide();
                        $("#icon_1_2").show();
                        $("#icon_2_1").show();
                        $("#txt_progress_2").attr('style','color:black');
                    }
                    else if (progress_val>=70){
                        $("#icon_1_1").hide();
                        $("#icon_1_2").show();
                        $("#icon_2_1").hide();
                        $("#icon_2_2").show();
                        $("#icon_3_1").show();

                        $("#txt_progress_2").attr('style','color:black');
                        $("#txt_progress_3").attr('style','color:black');
                    }

                    setTimeout(enhance_data_poll, 1000);
                }
                else{
                    $("#progress_bar_value").attr('style', 'width:100%');
                    move_to_results();
                }
            }
        });
    }
}
catch (err) {
    if (poll_errors<10){
        poll_errors += 1;
        enhance_data_poll();
    }

}

}

function get_job_id(data){
    $("#div_stats_enhanced").hide();
    $("#progress_bar_div").show();
    $("#div_pct").show();
    $("#tbl_progress").show();

    job_id = JSON.parse(data);
    job_id = job_id['job_id'];
    setTimeout(function(){
        enhance_data_poll();
    },1000);
}

function upload_done(){
    $("#details").hide();
    $("#captain").show();
    $("#a1").removeAttr('class');
    $("#a2").attr('class', 'active');
}

function move_to_results(){
    $("#captain").hide();
    $("#description").show();
    get_results();
    $("#a2").removeAttr('class');
    $("#a3").attr('class', 'active');
    $("#shareLinkDiv").show();
}

function state_map(state){
    if (state == 'CA'){
        return 'California';
    }
    else if (state == 'NY'){
        return 'New York';
    }
    else if (state == 'IL'){
        return 'Illinois';
    }
    else if (state == 'FL') {
        return 'Florida';
    }
    else{
        return state;
    }
}

function industry_transform(x){
    x = x.toLowerCase();
    var mapping = {};
    mapping['Finance'] = ['capital', 'financ', 'invest', 'insuranc'];
    mapping['Tech'] = ['comput', 'internet', 'cto', 'tech', 'wearable', 'developer', 'software', 'engineer', 'ux', 'user', 'data', 'java', 'python', 'css', 'electron', 'e-commerce', 'ecommerc', 'cloud', 'game', 'gamin', 'online', 'telco', 'tele', 'wireless', 'robot', 'renewable'];
    mapping['Research'] = ['research', 'professor', 'lecturer'];
    mapping['Media'] = ['publish', 'media', 'digital', 'writ', 'produc', 'act', 'entertai', 'video', 'tv', 'televi', 'satell', 'film', 'motion pic'];
    mapping['Marketing'] = ['marketi', 'adverti', 'public rel'];
    mapping['Retail'] = ['wear', 'retail', 'shop', 'beverag', 'restaur', 'wholsa', 'automo', 'consumer', 'clothing'];
    mapping['Arts'] = ['arts', 'photogra', 'music'];
    mapping['Legal'] = ['legal', 'law'];
    mapping['Press'] = ['editor', 'journal', 'writer'];
    mapping['Services'] = ['consult', 'incubator', 'constructio', 'hosting', 'transport'];
    mapping['Healthcare'] = ['health'];

    for (var k in mapping){
        for (var term in mapping[k]){
            if (x.indexOf(mapping[k][term])>-1){
                return k;
            }
        }
    }

    return x;
}

function chart_states(states, count){
    count_all = count.reduce(function(pV, cV, index, array){
        return pV + cV;
    });

    if (count[0] / count_all > 0.5){
        // majority from state 1
        html_val = 'The majority of attendees are from the state of <strong style="color:#82c484">' + state_map(states[0]) + '</sttrong>';
    }
    else{
        states_three = '';
        states_max = Math.min(3, states.length);
        for (var i=0; i < states_max; i++ ){
            states_three += '<strong style="color:#82c484">' + state_map(states[i]) + '</strong>';
            if (i == states_max - 2){
                states_three += ' and '
            }
            else if (i < states_max - 2){
                states_three += ', '
            }
        }

        html_val = 'Most attendess are from ' + states_three;
    }

    $("#p_states").html(html_val);

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart_states'
        },
        title:{text:null},
        legend:{enabled:false},
        xAxis:{categories: states, title:{text:null}},
        yAxis:{labels:{enabled:false}, title:{text:null}},
        credits: {enabled: false},
        series: [{
            type: 'column',
            name: 'Attendees',
            data: count
        }]
    });
}

function chart_industries(industries, count){
    count_all = count.reduce(function(pV, cV, index, array){
        return pV + cV;
    });

    if (count[0] / count_all > 0.5){
        // majority from state 1
        html_val = 'The majority of attendees are from the <strong style="color:#82c484">' + (industries[0]) + '</sttrong> industry';
    }
    else{
        industries_three = '';
        industries_max = Math.min(3, industries.length);
        for (var i=0; i < industries_max; i++ ){
            industries_three += '<strong style="color:#82c484">' + industries[i] + '</strong>';
            if (i == industries_max - 2){
                industries_three += ' and '
            }
            else if (i < industries_max - 2){
                industries_three += ', '
            }
        }

        html_val = 'Most attendess are from ' + industries_three;
    }

    $("#p_industries").html(html_val);

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart_industries'
        },
        title:{text:null},
        legend:{enabled:false},
        xAxis:{categories: industries, title:{text:null}},
        yAxis:{labels:{enabled:false}, title:{text:null}},
        credits: {enabled: false},
        series: [{
            type: 'bar',
            name: 'Attendees',
            data: count
        }]
    });
}


function chart_jobs(jobs, count) {
    count_all = count.reduce(function (pV, cV, index, array) {
        return pV + cV;
    });

    if (count[0] / count_all > 0.5) {
        // majority from state 1
        html_val = 'The majority of attendees are <strong style="color:#82c484">' + (jobs[0]) + '</sttrong>';
    }
    else {
        industries_three = '';
        industries_max = Math.min(3, jobs.length);
        for (var i = 0; i < industries_max; i++) {
            industries_three += '<strong style="color:#82c484">' + jobs[i] + '</strong>';
            if (i == industries_max - 2) {
                industries_three += ' and '
            }
            else if (i < industries_max - 2) {
                industries_three += ', '
            }
        }

        html_val = 'Most attendess are ' + industries_three;
    }

    $("#p_jobs").html(html_val);

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart_jobs'
        },
        title: { text: null },
        legend: { enabled: false },
        xAxis: { categories: jobs, title: { text: null } },
        yAxis: { labels: { enabled: false }, title: { text: null } },
        credits: { enabled: false },
        series: [{
            type: 'bar',
            name: 'Attendees',
            data: count
        }]
    });
}

function chart_cities(jobs, count) {
    count_all = count.reduce(function (pV, cV, index, array) {
        return pV + cV;
    });

    if (count[0] / count_all > 0.5) {
        // majority from state 1
        html_val = 'The majority of attendees are from <strong style="color:#82c484">' + (jobs[0]) + '</sttrong>';
    }
    else {
        industries_three = '';
        industries_max = Math.min(3, jobs.length);
        for (var i = 0; i < industries_max; i++) {
            industries_three += '<strong style="color:#82c484">' + jobs[i] + '</strong>';
            if (i == industries_max - 2) {
                industries_three += ' and '
            }
            else if (i < industries_max - 2) {
                industries_three += ', '
            }
        }

        html_val = 'Most attendess are from ' + industries_three;
    }

    $("#city_p").html(html_val);

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'city_chart'
        },
        title: { text: null },
        legend: { enabled: false },
        xAxis: { categories: jobs, title: { text: null } },
        yAxis: { labels: { enabled: false }, title: { text: null } },
        credits: { enabled: false },
        series: [{
            type: 'bar',
            name: 'Attendees',
            data: count
        }]
    });
}

function chart_zipcode(jobs, count) {
    count_all = count.reduce(function (pV, cV, index, array) {
        return pV + cV;
    });

    if (count[0] / count_all > 0.5) {
        // majority from state 1
        html_val = 'The majority of attendees are from <strong style="color:#82c484">' + (jobs[0]) + '</sttrong>';
    }
    else {
        industries_three = '';
        industries_max = Math.min(3, jobs.length);
        for (var i = 0; i < industries_max; i++) {
            industries_three += '<strong style="color:#82c484">' + jobs[i] + '</strong>';
            if (i == industries_max - 2) {
                industries_three += ' and '
            }
            else if (i < industries_max - 2) {
                industries_three += ', '
            }
        }

        html_val = 'Most attendess are from ' + industries_three;
    }

    $("#zipcode_p").html(html_val);

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'zipcode_chart'
        },
        title: { text: null },
        legend: { enabled: false },
        xAxis: { categories: jobs, title: { text: null } },
        yAxis: { labels: { enabled: false }, title: { text: null } },
        credits: { enabled: false },
        series: [{
            type: 'bar',
            name: 'Attendees',
            data: count
        }]
    });
}

function chart_twitter(jobs, count) {
    count_all = count.reduce(function (pV, cV, index, array) {
        return pV + cV;
    });

    if (count[0] / count_all > 0.5) {
        // majority from state 1
        html_val = 'The majority of attendees have <strong style="color:#82c484">' + (jobs[0]) + '</sttrong> followers';
    }
    else {
        industries_three = '';
        industries_max = Math.min(3, jobs.length);
        for (var i = 0; i < industries_max; i++) {
            industries_three += '<strong style="color:#82c484">' + jobs[i] + '</strong>';
            if (i == industries_max - 2) {
                industries_three += ' and '
            }
            else if (i < industries_max - 2) {
                industries_three += ', '
            }
        }

        html_val = 'Most attendess have ' + industries_three + ' followers';
    }

    $("#twitter_p").html(html_val);

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'twitter_chart'
        },
        title: { text: null },
        legend: { enabled: false },
        xAxis: { categories: jobs, title: { text: null } },
        yAxis: { labels: { enabled: false }, title: { text: null } },
        credits: { enabled: false },
        series: [{
            type: 'bar',
            name: 'Attendees',
            data: count
        }]
    });
}

function get_industries(data){
    industries = data['industry']['data'];
    results = get_stuff(industries);
    chart_industries(results[0], results[1]);
}

function get_jobs(data) {
    jobs = data['job_title']['data'];
    results = get_stuff(jobs);
    chart_jobs(results[0], results[1]);
}

function get_cities(data) {
    jobs = data['city']['data'];
    results = get_stuff(jobs);
    chart_cities(results[0], results[1]);
}

function get_zipcode(data) {
    jobs = data['zip_code']['data'];
    results = get_stuff(jobs);
    chart_zipcode(results[0], results[1]);
}

function get_twitter(data) {
    jobs = data['twitter_followers']['data'];
    results = get_stuff(jobs);
    chart_twitter(results[0], results[1]);
}


function get_stuff(stuffs){
    stuffs_array = [];
    for (var stuff in stuffs){
        val = stuffs[stuff];
        stuffs_array.push([val['label'], val['value']]);
    }

    stuffs_sorted = stuffs_array.sort(function(a, b) {return a[1] - b[1]}).reverse();

    var c = 0;
    stuff_name = [];
    stuff_count = [];
    for (stuff in stuffs_sorted){
        if (c>=5){
            break;
        }

        stuff_name.push(stuffs_sorted[stuff][0]);
        stuff_count.push(stuffs_sorted[stuff][1]);

        c++;
    }

    return [stuff_name, stuff_count];
}

function get_states(data){
    states = data['state']['data'];
    results = get_stuff(states);
    chart_states(results[0], results[1]);
}

function get_gender(data){
    var output = {};

    for (var g in data) {
        val = data[g];

        if (val['label'] == 'male') {
            output['male'] = val['value'];
        }
        else if (val['label'] == 'female') {
            output['female'] = val['value'];
        }
    }

    return output;
}

function get_skills(data) {
    skills = data['skills__name'];
    var count = {};
    for (var i in skills) {
        if (skills[i] != '') {
            skillies = skills[i].split(' ');
            if (skillies.length >0 ) {
                for (var skilled in skillies) {
                    count[skillies[skilled]] = count[skilled] + 1 || 1; // Increment counter for each value
                }
            }
        }
    }
    skill_array = [];
    for (var skill in count) {
        skill_array.push([skill, count[skill]]);
    }

    //WordCloud(document.getElementById('skills_canvas'), { list: skill_array });
}

function get_results(){
    $.ajax({
        url: accessfuel_api + 'job_results/' + job_id + '/JSON/All',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data);
            gen = get_gender(data['gender']['data']);
            pie_chart(gen);
            states = get_states(data);
            industries = get_industries(data);
            jobs = get_jobs(data);

            city = get_cities(data);
            zipcode = get_zipcode(data);
            twitter = get_twitter(data);

            $.ajax({
                url: accessfuel_api + 'job_results/' + job_id + '/JSON/skills__name',
                dataType: 'json',
                success: function (data) {
                    reportsUI.skillsReport($('.js-report-skills'), data);
                }
            });

            $.ajax({
                url: accessfuel_api + 'job_results/' + job_id + '/JSON/employment_domain',
                dataType: 'json',
                success: function (data) {
                    reportsUI.companyReport($('.js-report-company'), data);
                }
            });

            $("#shareLink").attr("href", window.location.href + "?job=" + job_id);
            //skills = get_skills(data);
        }
    });
}

function get_excel(){
    $form = $("#form_excel");
    $form.attr('action', accessfuel_api + 'job_results/' + job_id + '/Excel');
    $form.submit();

    // alert('trying');
    // $.ajax({
    //     url: accessfuel_api + 'job_results/' + job_id + '/Excel',
    //     type: 'GET',
    //     success: function(data) {
    //      alert('hi');
    //     }
    // });
}

function pie_chart(gen){
    male_prop = gen['male'] / (gen['male'] + gen['female']);
    //console.log(male_prop);

    if (male_prop > 0.8 | male_prop < 0.2){
        // heavy on one gender
        html_val = 'The majority of attendees, <strong>' + accounting.formatNumber( (male_prop>0.8 ? (100 * male_prop) : (100 * (1-male_prop) )) ) + '%</strong>, are <strong style="color:#82c484">' + (male_prop>0.8 ? 'male' : 'female') + '</strong>';
    }
    else if (male_prop > 0.6 | male_prop < .4){
        // more on one side
        gender_maj = male_prop > 0.5 ? 'male' : 'female';
        gender_maj_prop = gender_maj == 'male' ? male_prop : (1-male_prop);
        html_val = "There's a high proportion of <strong style='color:#82c484'>" + gender_maj  + "</strong> (" + accounting.formatNumber(100 * gender_maj_prop) + "%) to " + (gender_maj == 'male' ? "female" : "male") + "  attendees";
    }
    else{
        // pretty even
        gender_maj = male_prop > 0.5 ? 'male' : 'female';
        gender_maj_prop = gender_maj == 'male' ? male_prop : (1-male_prop);
        html_val = "There's a relatively even split between " + gender_maj  + " (" + accounting.formatNumber(100 * gender_maj_prop) + "%) and " + (gender_maj == 'male' ? "female" : "male") + "  attendees";
    }
    //console.log(html_val);

    $("#p_gender").html(html_val);

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart_gender'
        },
        title:{text:null},
        credits: {enabled: false},
        series: [{
            type: 'pie',
            name: 'Gender',
            data: [
                ['Male',   gen['male']],
                ['Female',   gen['female']]
            ]
        }]
    });
}

function upload_results(data){
    upload_done();

    console.log(data);
    file_id = data['file_id'];
    console.log(file_id);
    attributes = ['company', 'gender', 'title', 'location', 'email', 'name', 'e-mail'];
    // $('#count_sheets').text(data['sheets'].length);
    data_main = data['sheets'][0];
    rows = data_main['sheet_rows'];
    $("#stats_attendees").text(accounting.formatNumber(rows));

    base = data['sheets'][0]['sheet_report'];
    $("#stats_attributes").text(base.length);
    var set_of_attributes = [];
    var count_matched = 0;
    var matched_pct = 0;

    circle = '<i class="fa fa-circle"></i>';
    circle_o = '<i class="fa fa-circle-o"></i>';

    for (var k in base){
        column = base[k]['Column'];
        complete_pct = (100 * parseFloat(base[k]['Complete %'])).toFixed(0);
        unique = base[k]['Unique/Complete %'];
        found = false;

        for (var attr in attributes){
            if (column.toLowerCase().indexOf(attributes[attr]) > -1){
                count_matched ++;
                if (set_of_attributes.indexOf(attributes[attr]) < 0){
                    set_of_attributes.push(attributes[attr]);
                }
                found = true;
                matched_pct += parseFloat(complete_pct);
                break;
            }
        }

        if (found){
            html = '<tr><td></td><td>' + column + '</td><td>' + (unique>.7 ? (circle + circle + circle) : (unique>0.5 ? (circle + circle + circle_o): (circle + circle_o + circle_o))) + '</td><td style="text-align:center">' + complete_pct + '%</td><td style="text-align:center">' + (found ? '<i class="fa fa-check" style="color:#82c484"></i>' : '') + '</td></tr>';
            $('#tbl tbody').append(html);
        }

    }

    // top stats
    set_of_attributes_len = set_of_attributes.length;
    $("#stats_matched").text(count_matched);
    $("#stats_score").text((set_of_attributes.length).toFixed(1));
    $("#stats_matched").text(count_matched);
    $("#stats_complete").text( ( matched_pct / parseFloat(count_matched) ).toFixed(0) + '%' );
    $("#stats_enhanced").text( ( 100 * (10.0 / set_of_attributes_len - 1)).toFixed(0) + '%');
    $("#stats_additional").text(11- set_of_attributes.length);

    // add extra stuff
    extra = ['Gender', 'Age', 'Race', 'Location', 'Education', 'Skills', 'Twitter'];
    for (var a in extra){
        html = '<tr><td><input type="checkbox" checked></td><td>' + extra[a] + '</td><td>' + (circle + circle + circle) + '</td><td style="text-align:center;color:#ee5f5b">N/A</td><td></td></tr>';
        $('#tbl2 tbody').append(html);
    }

    $('#tbl').DataTable({
        'info':false,
        'paging':false,
        // "order": [[ 3, "desc" ]],
        'sorting':false,
    });

    $('#tbl2').DataTable({
        'info':false,
        'paging':false,
        // "order": [[ 3, "desc" ]],
        'sorting':false,
    });
}