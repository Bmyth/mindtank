Comp.ring = {
	show: _ring_show,
	hide: _ring_hide,
	moveTo: _ring_moveTo,
	innerRadius: 60,
	outerRadius: 160,
	smallDisk: null, 
	bigDisk: null
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
	if(this.smallDisk && this.bigDisk){
		this.moveTo(pos);
		return;
	}
	this.smallDisk = draw.circle().attr({
		r: 1,
		cx: pos.x,
		cy: pos.y,
		fill: 'transparent',
		stroke: '#ddd'
	});
	this.smallDisk.animate({
	  duration: 600
	}).attr('r',this.innerRadius);
	this.bigDisk = draw.circle().attr({
		r: 1,
		cx: pos.x,
		cy: pos.y,
		fill: 'transparent',
		stroke: '#aaa'
	});
	this.bigDisk.animate({
	  duration: 600
	}).attr('r',this.outerRadius);
	this.bigDisk.back();

	this.smallDisk.on('click',_ring_clickSmallRing);
	this.bigDisk.on('click',_ring_clickBigRing);
}

function _ring_hide() {
	this.smallDisk.remove();
	this.smallDisk = null;
	this.bigDisk.remove();
	this.bigDisk = null;
}

function _ring_moveTo(pos) {
	this.smallDisk.animate({
	  duration: 500
	}).center(pos.x, pos.y);
	this.bigDisk.animate({
	  duration: 500
	}).center(pos.x, pos.y);
}

function _ring_clickSmallRing(e){
	Nodes.handleNodeNext('serial')
}

function _ring_clickBigRing(e){
	Nodes.handleNodeNext('around', {x:e.clientX, y:e.clientY})
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