Comp.ring = {
	show: _ring_show,
	hide: _ring_hide,
	moveTo: _ring_moveTo,
	innerRadius: 60,
	outerRadius: 160,
	smallDisk: null, 
	bigDisk: null
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