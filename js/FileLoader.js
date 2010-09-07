/*
 * Data loading Worker.
 */
var $;
onmessage = function(e) {
	if (e.data === "start") {
		start();
	}
	if (e.data === "stop") {
		stop();
	}
};


var interval = -1;
function start() {
	interval = setInterval(function() {
		updateData()
	}, 250);
}
function stop() {
	clearInterval(interval);
}

function updateData() {
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', '/racedata/test.json', true);
	httpRequest.onload = function() {
		postMessage(httpRequest.responseText);
		httpRequest = null;
	};
	httpRequest.send(null);
/*
	$.ajax({
		url : '/racedata/test.json',
		dataType : 'json',
		success : function(data) {
			postMessage(data);
			// log('loaded data:');
			// log(data);
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			log(textStatus);
			log(errorThrown);
		}
	});
*/
}