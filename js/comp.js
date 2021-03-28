Comp.ring = {
	show: _ring_show,
	hide: _ring_hide,
	moveTo: _ring_moveTo,
	inOuterRange: _ring_inOuterRange,
	innerRadius: 60,
	outerRadius: 160,
	smallDisk: null, 
	bigDisk: null,
	phyObj: null
}

Comp.scope = {
	disk: null,
	radius: 80,
	clock : 0,
	keepTime : 10,
	visible : false,
	onFrame : _scope_onFrame,
	moveTo: _scope_moveTo,
	inside: _scope_inside
}

function _ring_show(pos) {
	if(this.bigDisk && this.smallDisk){
		this.moveTo(pos);
		return;
	}
	this.bigDisk = draw.circle().attr({
		r: 1,
		cx: pos.x,
		cy: pos.y,
		fill: '#fff',
		opacity: 0.1,
		stroke: '#333'
	});
	this.bigDisk.insertBefore(drawAnchor3)
	this.bigDisk.animate({
	  duration: 600
	}).attr('r',this.outerRadius);
	this.smallDisk = draw.circle().attr({
		r: 1,
		cx: pos.x,
		cy: pos.y,
		fill: '#fff',
		opacity: 0.2,
		stroke: '#666'
	});
	this.smallDisk.insertBefore(drawAnchor3)
	this.smallDisk.animate({
	  duration: 600
	}).attr('r',this.innerRadius);
	
	this.smallDisk.on('click',_ring_clickSmallRing);
	this.bigDisk.on('click',_ring_clickBigRing);
	this.phyObj =  Physic.addCircle({
		x: pos.x,
		y: pos.y,
		r: this.outerRadius,
		isStatic: true,
		frictionAir: 0.02,
		mass: 200
	});
}

function _ring_hide() {
	this.smallDisk.remove();
	this.smallDisk = null;
	this.bigDisk.remove();
	this.bigDisk = null;
	Physic.deleteObject(this.phyObj);
}

function _ring_moveTo(pos) {
	this.smallDisk.animate({
	  duration: 400
	}).center(pos.x, pos.y);
	this.bigDisk.animate({
	  duration: 400
	}).center(pos.x, pos.y);
	Physic.setPosition(this.phyObj, {x:pos.x,y:pos.y});
}

function _ring_clickSmallRing(e){
	Nodes.handleNodeNext('serial')
}

function _ring_clickBigRing(e){
	Nodes.handleNodeNext('around', {x:e.clientX, y:e.clientY})
}

function _ring_inOuterRange(pos){
	return Matter.Vector.magnitude({x:pos.x - centerX, y:pos.y - centerY}) < Comp.ring.outerRadius;
}

function _scope_onFrame(clock){
	if(this.disk && this.disk.visible() && this.clock == 0){
		this.disk.hide();
		this.visible = false;
		Nodes.updateScope();
	}
	if(this.clock > 0){
		this.clock -= 1;
	}
}

function _scope_moveTo(pos){
	if(!this.disk){
		this.disk = draw.circle().attr({
			r: this.radius,
			cx: pos.x,
			cy: pos.y,
			fill: '#fff'
		});
	}
	if(!this.disk.visible()){
		this.visible = true;
		this.disk.show();
	}
	this.disk.back();
	this.disk.center(pos.x, pos.y);
	this.clock = this.keepTime;
}

function _scope_inside(pos){
	var x = this.disk.cx();
	var y = this.disk.cy();
	return ((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y)) < (this.radius * this.radius)
}