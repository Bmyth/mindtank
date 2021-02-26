Comp.ring = {
	show: _ring_show,
	hide: _ring_hide,
	smallDisk: null, 
	bigDisk: null
}

function _ring_show(pos) {
	this.smallDisk = draw.circle().attr({
		r: 1,
		cx: pos.x,
		cy: pos.y,
		fill: 'transparent',
		stroke: '#ddd'
	});
	this.smallDisk.animate({
	  duration: 600
	}).attr('r',60);
	this.bigDisk = draw.circle().attr({
		r: 1,
		cx: pos.x,
		cy: pos.y,
		fill: 'transparent',
		stroke: '#aaa'
	});
	this.bigDisk.animate({
	  duration: 600
	}).attr('r',160);
	this.bigDisk.back();

	this.smallDisk.on('click',_ring_clickSmallRing);
	this.bigDisk.on('click',_ring_clickBigRing);
}

function _ring_hide() {
	
}

function _ring_clickSmallRing(e){
	Nodes.nextNode('serial')
}

function _ring_clickBigRing(e){
	console.log(e)
	Nodes.nextNode('parallel', {x:e.clientX, y:e.clientY})
}