function Polygon(name)
{
	this.nodes = [];
	this.name = name;
}

Polygon.prototype.nodes;
Polygon.prototype.name;

Polygon.prototype.addPoint = function(x, y)
{
	this.nodes.push({
		x : x, y : y
	});
	//console.log(this.name + ' has now ' + this.nodes.length + ' nodes');
}

Polygon.prototype.addAllPointReverse = function(polygon)
{
	this.nodes = this.nodes.concat(polygon.nodes.reverse());
}

Polygon.prototype.fill = function(context, color)
{
	if (color === undefined)
		context.fillStyle = '#000';
	else
		context.fillStyle = color;
	
	context.beginPath();
	
	var n = this.nodes[0];
	context.moveTo(n.x, n.y);
	for (var i = 1; i < this.nodes.length; i++)
	{
		n = this.nodes[i];
		if (typeof(n) == 'undefined') break;
		context.lineTo(n.x, n.y);
	}
	context.closePath();
	context.fill();
}

Polygon.prototype.stroke = function(context, color)
{
	if (color === undefined)
		context.strokeStyle = '#000';
	else
		context.strokeStyle = color;
	context.beginPath();
	
	var n = this.nodes[0];
	context.moveTo(n.x, n.y);
	for (var i = 1; i < this.nodes.length; i++)
	{
		n = this.nodes[i];
		if (typeof(n) == 'undefined') break;
		context.lineTo(n.x, n.y);
	}
	context.closePath();
	context.stroke();
}