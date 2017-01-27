var metrics = new Array(10);
var satisfied, tolerating, frustrated;

$(document).ready(
	function () {
		init();
		$('#calculate').click(
			displayFeedback
		);
		$('#apdex_t').blur(
		  calculateApdex
		).change(
            function() {
                $('#apdex').val('');
            }
        );
	}
);

function generateMetrics() {
	var max = Math.floor(Math.random() * 6000) + 2000;

	for (i = 0; i < metrics.length; i++) {
		metrics[i] = Math.floor(Math.random() * (max - 100)) + 100;
	}
}

function displayMetrics() {
	var i;
	var row = $('<tr />');
	var metricsTable = $('#metrics').empty();

	for (i = 0; i < (metrics.length / 2); i++) {
		var cell = $('<td />').text(metrics[i]);
		row.append(cell);
	}
	metricsTable.append(row);

	row = $('<tr />');
	for (i; i < metrics.length; i++) {
		var cell = $('<td />').text(metrics[i]);
		row.append(cell);
	}
	metricsTable.append(row);
}

function calculateApdex() {
	var apdex_t = $('#apdex_t').val();

    satisfied = new Array();
    tolerating = new Array();
    frustrated = new Array();

	for (i = 0; i < metrics.length; i++) {
		if (metrics[i] <= apdex_t) {
        	satisfied.push(metrics[i]);
	    } else if (metrics[i] > apdex_t && metrics[i] < apdex_t * 4) {
	        tolerating.push(metrics[i]);
	    } else {
	        frustrated.push(metrics[i]);
	    }
	}

	populateMetricTable(satisfied, $('#satisfied .values'));
	populateMetricTable(tolerating, $('#tolerating .values'));
	populateMetricTable(frustrated, $('#frustrated .values'));

	return (satisfied.length + (tolerating.length / 2)) / metrics.length;
}

function isValid() {
	if ($('#apdex').val() <= 0) {
	    $('#apdex').addClass('error');
	    $('#apdex-error').show();
		return false;
	} else {
	    $('#apdex').removeClass('error');
	    $('#apdex-error').hide();
	}
	return true;
}

function displayFeedback() {
    if (isValid()) {
        var apdex = calculateApdex();
        var userApdex = $('#apdex').val();

        var correct = ['Correct!', 'Nice work!', 'Great job!', 'You got it!'];
        var incorrect = ['Oops!', 'Sorry', 'Nice try', "Bzzzzt!"];
        var selected = Math.floor(Math.random() * 4);

        var heading = $('#feedback-heading');
        if (apdex == userApdex) {
            heading.text(correct[selected]);
        } else if (Math.abs(apdex - userApdex) <= 0.1) {
            heading.text('So close!');
        } else {
            heading.text(incorrect[selected]);
        }

        $('#feedback-apdex').text(apdex);
        $('#feedback-user-apdex').text(userApdex);
        if ($('#showme').is(':visible')) $('#feedback .showme').hide();

        $('#feedback').overlay({
            'speed' : 'fast',
            'load': true
        }).load();

		doPageAction(apdex, userApdex);
    }
}

function showMe() {
    if (satisfied == null) calculateApdex();
    $('#showme').show(500);
    $('#feedback').overlay().close();
    return false;
}

function populateMetricTable(metrics, table) {
	var i, j =1;
	var row = $('<tr />');

    table.empty();
    for (i = 0; i < metrics.length; i++) {
		var cell = $('<td />').text(metrics[i]);
		row.append(cell);

        j++;
        if (j > 2) {
            table.append(row);
            row = $('<tr />');
            j = 1;
        }
	}
    if (j > 1) table.append(row);
}

function doPageAction(apdex, userApdex) {
	var neededHint = $('#showme').is(':visible');
	newrelic.addPageAction('apdexCalculator', 
		{
			apdex: apdex, 
			userApdex: userApdex, 
			isCorrect: (apdex == userApdex).toString(), 
			neededHint: neededHint.toString()
		}
	);
}

function init() {
	generateMetrics();
	displayMetrics();
	$('#apdex').val('');
}