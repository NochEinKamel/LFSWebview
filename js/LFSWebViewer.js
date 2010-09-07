var trackMap = new TrackMap('mainCanvas');
$('#mainCanvas').click(function() {
	trackMap.toggle();
});

function log(msg) {
	if (console != undefined) {
		console.log(msg);
	}	
}