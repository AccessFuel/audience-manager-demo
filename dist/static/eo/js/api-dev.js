// $(document).ready(function (e) {
//     $("#uploadForm").on('change',(function(e) {
var accessfuel_api = "https://api.accessfuel.com/";
var file_id;
var job_id;
var reportsUI;
$(document).ready(function (e) {
    reportsUI = new Reports();

    if (!reportsUI) {
        return false;
    }


    $("#file").on('change', function (e) {
		$("#uploadFormP").html('<br><i class="fa fa-spinner fa-spin fa-3x"></i>');
		var data = new FormData();
		data.append('file', this.files[0]);
		ajax_it('upload', 'POST', data, upload_results);
	})
})

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
						$("#txt_progress_2").attr('style','color:black; font-size: large');
					}
					else if (progress_val>=70){
						$("#icon_1_1").hide();
						$("#icon_1_2").show();
						$("#icon_2_1").hide();
						$("#icon_2_2").show();
						$("#icon_3_1").show();

						$("#txt_progress_2").attr('style','color:black; font-size: large');
						$("#txt_progress_3").attr('style','color:black; font-size: large');
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
            type: 'column',
            name: 'Attendees',
            data: count
        }]
    });
}

function get_industries(data){
	industries = data['industry'];
	// log('industry');
	var count = {};
	for (i in industries) {
		num = industries[i];
		// console.log('val: ' + num);
		if (num.length > 0 && num != '[]') {
			// console.log(num + ' mapped to:');
			//num = industry_transform(num);
			// console.log(num);
			count[num] = count[num] + 1 || 1; // Increment counter for each value
		}
	};

	industries_array = [];
	for (var industry in count){
		industries_array.push([industry, count[industry]]);
	}

	industries_sorted = industries_array.sort(function(a, b) {return a[1] - b[1]}).reverse();

	var c = 0;
	industry_name = [];
	industry_count = [];
	for (industry in industries_sorted){
		if (c>=5){
			break;
		}

		industry_name.push(industries_sorted[industry][0]);
		industry_count.push(industries_sorted[industry][1]);

		c++;
	}

	//console.log(industries);
	//console.log(industry_name);
	//console.log(industry_count);
	chart_industries(industry_name, industry_count);

}

function get_jobs(data) {
    jobs = data['job_title'];
    // log('industry');
    var count = {};
    for (i in jobs) {
        num = jobs[i];
        // console.log('val: ' + num);
        if (num.length > 0 && num != '[]') {
            // console.log(num + ' mapped to:');
            //num = industry_transform(num);
            // console.log(num);
            count[num] = count[num] + 1 || 1; // Increment counter for each value
        }
    };

    jobs_array = [];
    for (var job in count) {
        jobs_array.push([job, count[job]]);
    }

    jobs_array_sorted = jobs_array.sort(function (a, b) { return a[1] - b[1] }).reverse();

    var c = 0;
    jobs_name = [];
    jobs_count = [];
    for (job in jobs_array_sorted) {
        if (c >= 5) {
            break;
        }

        jobs_name.push(jobs_array_sorted[job][0]);
        jobs_count.push(jobs_array_sorted[job][1]);

        c++;
    }

    //console.log(industries);
    //console.log(industry_name);
    //console.log(industry_count);
    chart_jobs(jobs_name, jobs_count);

}

function get_states(data){
	states = data['state'];
	var count = {};
	$.each(states, function(){
	    var num = this; // Get number
	    if (num.length == 2 && num != '[]'){
	    	count[num] = count[num]+1 || 1; // Increment counter for each value
	    }
	});

	states_array = [];
	for (var state in count){
		states_array.push([state, count[state]]);
	}
	      
	states_sorted = states_array.sort(function(a, b) {return a[1] - b[1]}).reverse();

	var c = 0;
	state_name = [];
	state_count = [];
	for (state in states_sorted){
		if (c>=5){
			break;
		}

		state_name.push(states_sorted[state][0]);
		state_count.push(states_sorted[state][1]);

		c++;
	}

	chart_states(state_name, state_count);
}

function get_gender(data){
	return data['gender'];
	//gender = data['gender'];
	////console.log(gender);
	//male = 0;
	//female = 0;
    //
	//for (var k in gender){
	//	if (gender[k].indexOf("'male")>-1){
	//		male += 1;
	//	}
	//	else if (gender[k].indexOf("'female")>-1){
	//		female += 1;
	//	}
	//}
    //
	//return {'male': male, 'female':female};
}

function get_skills(data) {
    skills = data['skills__name'];
    var output = {};
    output.data = [];
    output.summary = {};
    var tmp = {};
    for (var i in skills) {
        tmp.label = i;
        tmp.value = skills[i];
        output.data.push(tmp);
        tmp = {};
        
    }
    
    return output;
    
}

function get_comp(data) {
    skills = data['employment_domain'];
    var output = {};
    output.data = [];
    output.summary = {};
    var tmp = {};
    for (var i in skills) {
        tmp.label = i;
        tmp.value = skills[i];
        output.data.push(tmp);
        tmp = {};

    }

    return output;

}

function get_education(data) {
    skills = data['skills__name'];
    var output = {};
    output.data = [];
    output.summary = {};
    var tmp = {};
    for (var i in skills) {
        tmp.label = i;
        tmp.value = skills[i];
        output.data.push(tmp);
        tmp = {};

    }

    return output;

}


function get_results(){
	$.ajax({
	    url: accessfuel_api + 'job_results/' + job_id + '/JSON/All',
	    type: 'GET',
	    dataType: 'json',
	    success: function(data) {
	    	console.log(data);
	    	gen = get_gender(data);
	    	pie_chart(gen);

	    	$.ajax({
	    	    url: accessfuel_api + 'job_results/' + job_id + '/JSON/employment_domain',
	    	    dataType: 'json',
	    	    success: function (data) {
	    	        reportsUI.companyReport($('.js-report-company'), data);
	    	    }
	    	});

	    	$.ajax({
	            url: accessfuel_api + 'job_results/' + job_id + '/JSON/skills__name',
	            dataType: 'json',
	            success: function (data) {
	                reportsUI.skillsReport($('.js-report-skills'), data);
	            }
	    	});

	    	$.ajax({
	    	    url: accessfuel_api + 'job_results/' + job_id + '/JSON/city',
	    	    dataType: 'json',
	    	    success: function (data) {
	    	        reportsUI.cityReport($('.js-report-city'), data);
	    	    }
	    	});

	    	$.ajax({
	    	    url: accessfuel_api + 'job_results/' + job_id + '/JSON/industry',
	    	    dataType: 'json',
	    	    success: function (data) {
	    	        reportsUI.industryReport($('.js-report-industry'), data);
	    	    }
	    	});

	    	$.ajax({
	    	    url: accessfuel_api + 'job_results/' + job_id + '/JSON/job_title',
	    	    dataType: 'json',
	    	    success: function (data) {
	    	        reportsUI.jobsReport($('.js-report-job_title'), data);
	    	    }
	    	});

	    	
	    	

	    	//education = get_education(data);
	    	//reportsUI.educationReport($('.js-report-education'), education);

	    	//states = get_states(data);
	    	//industries = get_industries(data);
	    	//jobs = get_jobs(data);
	    	
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
	//     	alert('hi');
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

	

	

	var chart = new Highcharts.Chart({
	    chart: {
	        renderTo: 'report-gender',
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
	$("#txt_attendees").text(accounting.formatNumber(rows));

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

		html = '<tr><td></td><td>' + column + '</td><td style="text-align: center">' + (unique>.7 ? (circle + circle + circle) : (unique>0.5 ? (circle + circle + circle_o): (circle + circle_o + circle_o))) + '</td><td style="text-align:center">' + complete_pct + '%</td><td style="text-align:center">' + (found ? '<i class="fa fa-check" style="color:#82c484"></i>' : '-') + '</td></tr>';
		if (found){
			$('#tbl tbody').append(html);	
		}
		else{
			$('#tbl_unmatched tbody').append(html);
		}

	}

	// top stats
	set_of_attributes_len = set_of_attributes.length;
	$("#stats_matched").text(count_matched);
	$("#stats_matched2").text(count_matched);
	$("#stats_unmatched").text(base.length - count_matched);
	$("#stats_score").text((set_of_attributes.length).toFixed(1));
	$("#stats_matched").text(count_matched);
	$("#stats_complete").text( ( matched_pct / parseFloat(count_matched) ).toFixed(0) + '%' );
	$("#stats_enhanced").text( ( 100 * (10.0 / set_of_attributes_len - 1)).toFixed(0) + '%');
	$("#stats_additional").text(4);

	// add extra stuff
	extra = ['Gender', 'Location', 'Industry', 'Job title', 'Company', 'Age', 'Education', 'Skills', 'Race', 'Income', 'Twitter stats', 'Social influence'];

	var c = 0;
	var free = true;
	for (var a in extra){
		if (c>3){
			free = false;
		}

		var html = '<tr><td><input type="checkbox"' + (free?' checked':'') + '></td><td>' + extra[a] + '</td><td style="text-align: center">' + (circle + circle + circle) + '</td><td style="text-align: center">' + (free?'10%':'100%') + '</td><td style="text-align: center">' + (free?'<span style="color:#82c484">FREE</span>':'Premium') + '</td></tr>';

		$('#tbl2' + (free?'':'_2') + ' tbody').append(html);

		c++;
	}

	$('#tbl').DataTable({
		'info':false,
		'paging':false,
		// "order": [[ 3, "desc" ]],
		'sorting':false
	});

	$('#tbl2').DataTable({
		'info':false,
		'paging':false,
		// "order": [[ 3, "desc" ]],
		'sorting':false
	});

	$('#tbl_unmatched').DataTable({
		'info':false,
		'paging':false,
		// "order": [[ 3, "desc" ]],
		'sorting':false
	});
}