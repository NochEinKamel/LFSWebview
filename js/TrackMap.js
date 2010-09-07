var globScale =  

function TrackMap(id)
{
	var elem = document.getElementById(id);
	this.elemId = id;
	this.context = elem.getContext("2d");
	this.width = elem.width;
	this.height = elem.height;
}

TrackMap.prototype.interval = -1;
TrackMap.prototype.worker;
TrackMap.prototype.racedata;
TrackMap.prototype.start = function()
{
	var viewer = this;
	
	// graphics
	this.interval = setInterval(function() {viewer.updateGraphics();}, 50);
	log('started');
	
	// race-data loading
	if (this.worker == undefined) {
		this.worker = new Worker('/js/FileLoader.js');
		this.worker.onmessage = function(e) {
			viewer.racedata = jQuery.parseJSON(e.data);
			viewer.dataLoadedAt = new Date().getTime();
		}
	}
	// init worker
	//this.worker.postMessage({"jQuery" : jQuery});
	// start worker
	this.worker.postMessage("start");
	
	// key and mouse actions
	$('#'+this.elemId).mousewheel(function(event, delta) {
		log("mousewheel");
		log(event);
		log(delta);
	    //viewer.zoom(delta);
	});
}
TrackMap.prototype.stop = function()
{
	// clear updateGraphics loop
	clearInterval(this.interval);
	this.interval = -1;
	// stop data loading process
	this.worker.postMessage("stop");
	
	log('stopped');
}
TrackMap.prototype.toggle = function()
{
	if (this.interval < 0)
	{
		this.start();
	}
	else
	{
		this.stop();
	}
}

TrackMap.prototype.elemId;
TrackMap.prototype.context;
TrackMap.prototype.width;
TrackMap.prototype.height;

TrackMap.prototype.updateGraphics = function()
{
	//log('updateGraphics');
	this.drawCircuit();
	
	this.drawCars();

	/*
	g2.setColor(Color.black);
	g2.setFont(new Font("Goudy Handtooled BT", Font.PLAIN, 12));
	g2.scale(1/scale, -1/scale);
	
	g2.drawString(fps + " FPS", 2, -2);
	
	currfps++;
	renderTime += System.currentTimeMillis() - lastTime;
	lastTime = System.currentTimeMillis();
	if (renderTime > 1000)
	{
		fps = currfps;
		renderTime = 0;
		currfps = 0;
	}
	*/
}

TrackMap.prototype._trackData = null;
TrackMap.prototype.trackData = function()
{
	if (this._trackData == null && this.racedata != null)
	{
		var viewer = this;
		$.ajax({
			url: 'json/'+this.racedata.Info.Track+'.json',
			dataType: 'json',
			success: function(data)
			{
				viewer._trackData = data;
				//log('loaded track:');
				//log(data);
				viewer.updateGraphics();
			},
			error : function(XMLHttpRequest, textStatus, errorThrown)
			{
				log(textStatus);
				log(errorThrown);
			}
		});
	}
	return this._trackData;
}

TrackMap.prototype.scale = -1;
TrackMap.prototype.centerX = -1;
TrackMap.prototype.centerY = -1;

TrackMap.prototype.drawCircuit = function()
{
	var g2 = this.context;
	var track = this.trackData();
	
	// track data lot loaded yet.
	if (track == null)
	{
		return;
	}
	
	g2.strokeStyle = '#000';
	g2.fillStyle = '#000';
	g2.lineWidth = 100000;

		
	// set scale to fit the window.
	if (this.scale == -1 || this.centerX == -1 || this.centerY == -1)
	{
		var xUnits = track.maxX - track.minX + 65536 * 100;
		var yUnits = track.maxY - track.minY + 65536 * 100;
		
		var uppX = xUnits / this.width;
		var uppY = yUnits / this.height;
				
		//this.scale = 1.0 / Math.max(uppX, uppY) * 2; // DEBUG
		this.scale = 1.0 / Math.max(uppX, uppY);
		this.centerX = ((this.width / 2) / this.scale) - (track.maxX + track.minX) / 2;
		this.centerY = ((this.height / 2) / -this.scale) - (track.maxY + track.minY) / 2;
		
		//log("Scale:" + this.scale + ", Center: " + this.centerX + "/" + this.centerY);
		
		g2.scale(this.scale, -this.scale);
		
		//g2.translate(this.centerX + 10000000, this.centerY - 24000000); // DEBUG
		g2.translate(this.centerX, this.centerY);
	}
		
	this.drawGrid();
	this.drawTrack();
	
	//drawLayout(g2);
}

TrackMap.prototype.drawGrid = function()
{
	this.context.moveTo(-65536 * 1000, 0);
	this.context.lineTo(65536 * 1000, 0);
	this.context.moveTo(0, -65536 * 1000);
	this.context.lineTo(0, 65536 * 1000);
	this.context.stroke();
}
	
TrackMap.prototype.drawTrack = function()
{
	if (this.nodes == null)
	{
		this.calculateNodes();
	}
	
	for (var s = 0; s < this.trackData().splitCount; s++)
	{
		this.sectorLimits[s].fill(this.context, '#777');
		this.roadLimits[s].fill(this.context, '#000');
	}
	
	this.nodes.stroke(this.context, '#0F0');
	this.markNode(0);
	this.markNode(this.trackData().sector1Node);
	this.markNode(this.trackData().sector2Node);
	this.markNode(this.trackData().sector3Node);
	
/*	
	// reorder... narf ;P
	for (int j = 0; j < track.splitCount; j++)
	{
		// Sector outline
		g2.setColor(Color.gray);		
		g2.fill(limitR[j]);
		// Sector road
		for (int flg : yFlags.keySet())
		{
			if (yFlags.get(flg).getSector() == j)
			{
				g2.setColor(Color.yellow);
			}
		}
		if (g2.getColor() == Color.gray)
		{
			g2.setColor(Color.black);
		}
		g2.fill(roadR[j]);
	}
	
	g2.setColor(Color.green);
	g2.drawPolygon(nodes);
	
	// draw start finish line :)
	markNode(g2, track.getStartNode(), Color.red);
	markNode(g2, track.getSplit1Node());
	if(track.splitCount > 2)
	{
		markNode(g2, track.getSplit2Node());
	}
	if(track.splitCount > 3)
	{
		markNode(g2, track.getSplit3Node());
	}*/
}

TrackMap.prototype.markNode = function(nodeNum, color)
{
	if (color === undefined)
	{
		color = '#F00';
	}
	if (nodeNum < 0 || nodeNum >= this.trackData().numNodes)
	{
		return;
	}
	
	var node = this.trackData().nodes[nodeNum];
	
	// calculate
	var orthX = node.dirY;
	var orthY = - node.dirX;
	
	this.context.strokeStyle = color;
	this.context.beginPath();
	this.context.moveTo(node.X + node.limitL * orthX * 65536, node.Y + node.limitL * orthY * 65536);
	this.context.lineTo(node.X + node.limitR * orthX * 65536, node.Y + node.limitR * orthY * 65536);
	this.context.stroke();
}

TrackMap.prototype.dataLoadedAt;
TrackMap.prototype.drawCars = function() {
	// check if necessary data is available
	if (this.racedata == null)
	{
		return;
	}
	
	var timeStep = 0;
	if (this.dataLoadedAt != undefined) {
		timeStep = new Date().getTime() - this.dataLoadedAt;
	}
	
	for (playerID in this.racedata.Player)
	{
		var playerData = this.racedata.Player[playerID];
		var MCI = this.racedata.MCI[playerID];
		if (playerData == undefined)
		{
			log('No player found for id ' + playerID);
			continue;
		}
		if (MCI == undefined)
		{
			log('No MCI for player ID ' + playerID);
			continue;
		}
		//log('Drawing car for player: ' + playerID);
		
		// calculate the expected position of the car...
		
		// calculate angle of car
		// the heading is changing ;)
		// short	AngVel;	// signed, rate of change of heading : (16384 = 360 deg/s)
		var anglePerMS = MCI.AngVel / 100;
		var heading = MCI.Heading + (anglePerMS * timeStep) / 2;
		var arc = -Math.PI * heading / 32767;
		if (arc < 0)
		{
			arc = 2 * Math.PI + arc;
		}
		
		// calculate
		var headX = Math.sin(arc);
		var headY = Math.cos(arc);
		var orthX = headY;
		var orthY = -headX;

		
// WE TAKE HEADING INSTEAD OF DIRECTION FOR NOW AS DIRECTION HAS A ANGVAL VALUE
		
//			// we need the direction for that.
//			// direction of car's motion : 0 = world y direction, 32768 = 180 deg
//			double dirArc = -Math.PI * car.getDirection() / 32767;
//			if (dirArc < 0) {
//				dirArc = 2 * Math.PI + dirArc;
//			}
//			// onthagonal parts ;D
//			double dirX = (double) Math.sin(dirArc);
//			double dirY = (double) Math.cos(dirArc);
		
		// determine position
		var carX = MCI.X;
		var carY = MCI.Y;
		
		if (timeStep > 0)
		{
			// now take the speed
			var unitsPerMS = MCI.Speed * 65536 / 32767 / 10;
			carX = carX + unitsPerMS * timeStep * headX;
			carY = carY + unitsPerMS * timeStep * headY;
		}
		
		// STORE new position
		//car.getPosition().setX((int) carX);
		//car.getPosition().setY((int) carY);
		//this.context.scale(10,10);
		// DRAW THE CAR!!11
		var carPoly = new Polygon();
		carPoly.addPoint(
				carX + 65536 * 5 * headX,
				carY + 65536 * 5 * headY
		);
		carPoly.addPoint(
				carX + 65536 * 4 * (orthX - headX),
				carY + 65536 * 5 * (orthY - headY)
		);
		carPoly.addPoint(
				carX - 65536 * 4 * headX,
				carY - 65536 * 4 * headY
		);
		carPoly.addPoint(
				carX - 65536 * 4 * (orthX + headX),
				carY - 65536 * 5 * (orthY + headY)
		);
		
		// choose a random color
		var color = 'rgb('+ ((playerID * 50) % 255 + ', ' + (playerID * 100) % 255 + ', ' + (playerID * 66) % 255) + ')';
		carPoly.fill(this.context, color);
		
		color = '#999';
		carPoly.stroke(this.context, color);
		//this.context.scale(0.1,0.1);
		/*
		int spaceX = 10 * 65536;
		
		if (yFlags.containsKey(key) || bFlags.containsKey(key)) {
			// draw a flag :)
			Polygon flag = new Polygon();
			flag.addPoint(
					(int) (carX + 65536 * 15),
					(int) (carY + 65536 * -10)
			);
			flag.addPoint(
					(int) (carX + 65536 * 15),
					(int) (carY + 65536 * 10)
			);
			flag.addPoint(
					(int) (carX + 65536 * 18),
					(int) (carY + 65536 * 10)
			);
			flag.addPoint(
					(int) (carX + 65536 * 27),
					(int) (carY + 65536 * 6)
			);
			flag.addPoint(
					(int) (carX + 65536 * 27),
					(int) (carY + 65536 * -2)
			);
			flag.addPoint(
					(int) (carX + 65536 * 18),
					(int) (carY + 65536 * 2)
			);
			flag.addPoint(
					(int) (carX + 65536 * 18),
					(int) (carY + 65536 * -10)
			);
			
			if (yFlags.containsKey(key)) {
				g2.setColor(Color.yellow);
			} else {
				g2.setColor(Color.cyan);
			}
			
			g2.setStroke(new BasicStroke(100000));
			g2.fill(flag);
			g2.setColor(Color.black);
			g2.draw(flag);
			
			// push text more to the right
			spaceX = 30 * 65536;
		}
		
		
		g2.setColor(Color.black);
		g2.setFont(new Font("Goudy Handtooled BT", Font.PLAIN, 800000));
		g2.scale(1, -1);
		 
		String driverName = driver.getPlayerName();
		if (driver.isStanding())
			driverName = "***" + driverName;
		*/
		/*
		this.context.scale(1, -1);
		this.context.font = "20000000pt Arial red";
		this.context.strokeText(playerData.Name + "(" + playerData.Car + ")", MCI.X + 30 * 65536, -MCI.Y);
		this.context.scale(1, -1);
		*/
	}
	
	// save the time the cars were drawn for the last time :)
	//this.carsLastDrawn = new Date().getTime();
}


TrackMap.prototype.sectorLimits;
TrackMap.prototype.roadLimits;
TrackMap.prototype.nodes;

TrackMap.prototype.calculateNodes = function()
{
	this.nodes = new Polygon('n');
	this.sectorLimits = [new Polygon('s0'), new Polygon('s1'), new Polygon('s2'), new Polygon('s3')];
	this.roadLimits = [new Polygon('r0'), new Polygon('r1'), new Polygon('r2'), new Polygon('r3')];
	var sectorLimitsLeft = [new Polygon('s0L'), new Polygon('s1L'), new Polygon('s2L'), new Polygon('s3L')];
	var roadLimitsLeft = [new Polygon('r0L'), new Polygon('r1L'), new Polygon('r2L'), new Polygon('r3L')];
	
	
	// create polygons... Oo
	for (var i = 0; i < this.trackData().numNodes; i++)
	{
		var node = this.trackData().nodes[i];
		this.nodes.addPoint(node.X, node.Y);
		
		var s = this.getSectorForNode(i);
		
		// calculate
		var orthX = node.dirY;
		var orthY = - node.dirX;
		
		this.sectorLimits[s].addPoint(
			node.X + node.limitR * orthX * 65536,
			node.Y + node.limitR * orthY * 65536
		);
		sectorLimitsLeft[s].addPoint(
			node.X + node.limitL * orthX * 65536,
			node.Y + node.limitL * orthY * 65536
		);
		this.roadLimits[s].addPoint(
			node.X + node.roadR * orthX * 65536,
			node.Y + node.roadR * orthY * 65536
		);
		roadLimitsLeft[s].addPoint(
			node.X + node.roadL * orthX * 65536,
			node.Y + node.roadL * orthY * 65536
		);
	}
	
	for (var s = 0; s < this.trackData().splitCount; s++)
	{
		// add first node of following sector to previous sector
		var nextFirstSectorLimit = this.sectorLimits[(s+1) % this.trackData().splitCount].nodes[0];
		this.sectorLimits[s].addPoint(nextFirstSectorLimit.x, nextFirstSectorLimit.y);
		
		// add first node of following sector to previous sector
		var nextFirstSectorLimitLeft = sectorLimitsLeft[(s+1) % this.trackData().splitCount].nodes[0];
		sectorLimitsLeft[s].addPoint(nextFirstSectorLimitLeft.x,nextFirstSectorLimitLeft.y);
		
		// add first node of following sector to previous sector
		var nextFirstRoadLimit = this.roadLimits[(s+1) % this.trackData().splitCount].nodes[0];
		this.roadLimits[s].addPoint(nextFirstRoadLimit.x, nextFirstRoadLimit.y);
		
		// add first node of following sector to previous sector
		var nextFirstRoadLimitLeft = roadLimitsLeft[(s+1) % this.trackData().splitCount].nodes[0];
		roadLimitsLeft[s].addPoint(nextFirstRoadLimitLeft.x, nextFirstRoadLimitLeft.y);
	}
	
	
	// reorder... narf ;P
	for (var s = 0; s < this.trackData().splitCount; s++)
	{
		this.sectorLimits[s].addAllPointReverse(sectorLimitsLeft[s]);
		this.roadLimits[s].addAllPointReverse(roadLimitsLeft[s]);
	}
}

TrackMap.prototype.getSectorForNode = function(nodeNumber)
{
	if (nodeNumber < this.trackData().sector1Node)
	{
		return 0;
	} else if (this.trackData().sector2Node < 0 || nodeNumber < this.trackData().sector2Node)
	{
		return 1;
	} else if (this.trackData().sector3Node < 0 || nodeNumber < this.trackData().sector3Node)
	{
		return 2;
	} else
	{
		return 3;
	}
}
