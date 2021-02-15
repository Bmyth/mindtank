_liquid_top = 120;
_liquid_num = 10;
function Liquid(){
	var liquid = {
		amount: _liquid_num,
		count: 0,
		width: windowWidth * (1 - boardWidth),
		height: windowHeight - _liquid_top,
		top: _liquid_top,
		bottom: windowHeight + 20,
		left: 0,
		right: windowWidth * (1 - boardWidth),
		widthStep: windowWidth / (_liquid_num - 1),
		path : null
	}
	liquid.waveAt = _liquid_waveAt;
	liquid.getLiqiudPoint = _liquid_getPoint;
	liquid.getYAt = _liquid_getYAt;
	liquid.isAbove = _liquid_isAbove;
	liquid.still = true;
	Physic.addLiquidChain(liquid);
	liquid.phyObjs = Physic.getObjectByIdx('liquidNodes');
	liquid.path = _liquid_createPath();
	return liquid;
}

function _liquid_waveAt(x, strength) {
	var index = _liquid_getNearestPoint(x);
	if(index == null){
		return;
	}

	var node = this.phyObjs.bodies[index];
	// Physic.applyForce(node, {x:0, y:5})
	// var segment = this.path.segments[index];
	// var point = segment.point;
}

function _liquid_getPoint(x) {
	var index = _liquid_getNearestPoint(x);
	if(index == null){
		return;
	}
	var segment = _Liquid.path.segments[index];
	return segment.point;
}

function _liquid_getYAt(index) {
	var segment = _Liquid.path.segments[index];
	return segment.point.y;
}

function _liquid_createPath() {
	var path = new Path({
		strokeColor: '#55caf7',
		strokeWidth: 1.2
	});
	
	var liquidNodes = Physic.getObjectByIdx('liquidNodes');
	for (var i = 0; i < liquidNodes.bodies.length; i++) {
		var n = liquidNodes.bodies[i];
		var x = n.position.x;
		var y = n.position.y;
		var segment = path.add(new Point(x, y));
		var point = segment.point;
	}
	path.onFrame = _liquid_onFrame;
	return path;
}

function _liquid_onFrame(event) {
	var path = Comp.liquid.path;
	var liquidNodes = Comp.liquid.phyObjs;
	var diff = false;
	for (var i = 0; i < liquidNodes.bodies.length; i++) {
		var n = liquidNodes.bodies[i];
		var point = path.segments[i].point;
		if(n.position.x != point.x){
			point.x = n.position.x;
			diff = true;
		}
		if(n.position.y != point.y){
			point.y = n.position.y;
			diff = true;
		}
	}
	if(diff){
		path.smooth({ type: 'continuous', from: 0, to: Comp.liquid.amount - 1});
	}
}

function _liquid_getNearestPoint(x) {
	if(x <= Comp.liquid.left || x >= Comp.liquid.right){
		return null;
	}
	var n = (x - Comp.liquid.left ) / Comp.liquid.widthStep;
	var f = Math.floor(n);
	var r = n - f;
	if(r > 0.5){
		f = f + 1;
	}
	return f + 1;
}

function _liquid_isAbove(y){
	return y < this.top;
}
