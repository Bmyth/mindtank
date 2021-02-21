var minNodeDistance = 100;
function Node(params){
	var node = {};
	node.uid = generateUid();
	node.onPath = params.onPath ? true : false;
	node.nid = params.nid;
	node.prevUid = params.prevuid;
	node.moveStatus = 'float';
	node.displayType = '';
	node.target = null;
	node.ele = null;

	node.onFrame = _node_onFrame;
	node.displayAs = _node_displayAs;
	node.setStatic = _node_setStatic; 
	node.moveTo = _node_moveTo;
	node.focus = _node_focus;
	node.setAround = _node_setAround;
	node.setUnAround = _node_setUnAround;

	//pos
	if(params.pos){
		node.posX = params.pos.x;
		node.posY = params.pos.y;
	}else{ 
		node.posX = windowWidth * Math.random();
		node.posY = windowHeight * Math.random();
	}

	//ele
	node.displayAs('dot');	

	//pathlink
	// if(node.prevUid){
	// 	node.prevNode = Nodes.getNodeByUid(node.prevUid);
	// 	node.prevX = node.prevNode.posX;
	// 	node.prevY = node.prevNode.posY;
	// 	node.link = draw.line(node.posX, node.posY, node.prevX, node.prevY).stroke({ width: 0.5,color: '#666'});
	// }

	//phyobj
	// var prevObj = node.prevNode ? node.prevNode.phyObj : null;
	var isStatic = false;
	node.phyObj = Physic.addCircle({
		x: node.posX,
		y: node.posY,
		r: 12,
		isStatic: isStatic,
		frictionAir: 0.01,
		mass: 20
	});
	return node;
}

function _node_onFrame(i) {
	var d = 0;
	var x = this.phyObj.position.x;
	var y = this.phyObj.position.y;
	//move
	if(this.onAnimate){
		if(this.ele.type == 'circle'){
			x = this.ele.cx();
			y = this.ele.cy();
		}
		if(this.ele.type == 'text'){
			x = this.ele.x();
			y = this.ele.y();
		}
		
		d += Math.abs(this.posX - x) + Math.abs(this.posY - y);
		this.posX = x;
		this.posY = y;
		Physic.setPosition(this.phyObj, {x:x,y:y});
	}else{
		x = this.phyObj.position.x;
		y = this.phyObj.position.y;
		if(this.posX != x || this.posY != y){
			d = d + Math.abs(this.posX - x) + Math.abs(this.posY - y);
			this.posX = x;
			this.posY = y;
			this.ele.center(this.posX, this.posY)
		}
	}
	if(this.prevNode && (this.prevX != this.prevNode.posX || this.prevY != this.prevNode.posY)){
		d = d + Math.abs(this.prevNode.posX - this.prevX) + Math.abs(this.prevNode.posY - this.prevY);
		this.prevX = this.prevNode.posX;
		this.prevY = this.prevNode.posY;
	}

	// if(this.link){
	// 	this.link.plot(this.posX, this.posY, this.prevNode.posX, this.prevNode.posY);
	// }
	
	//update link
	if(d > 0.1){
		Nodes.updatingUids.push(this.uid)
	}
}

function _node_displayAs(type) {
	if(this.displayType == type){
		return;
	}
	this.displayType = type;
	this.ele && this.ele.remove();
	var ele;
	if(type == 'dot'){
		ele = draw.circle(5).fill('#aaa').attr('uid',this.uid);
	}
	else if(type == 'text'){
		ele = draw.plain(Model.getText(this.nid)).fill('#666').font({size:14}).attr('uid',this.uid);
	}else if(type == 'none'){
		ele = draw.circle(5).fill('#aaa').attr('uid',this.uid);
		// ele.hide();
	}

	ele.center(this.posX, this.posY);
	ele.on('mouseenter',_node_mouseEnter);
	ele.on('mouseleave',_node_mouseLeave);
	ele.on('click',_node_mouseClick);
	this.ele = ele;
}

function _node_focus() {
	this.focus = true;
	this.displayAs('dot');
	this.moveTo({x:windowWidth * 0.5, y:windowHeight * 0.5})
}

function _node_float() {
	if(!this.phyObj.isStatic){
		var force = this.onPath ? 0.01 : 0.05;
		var x = force * (Math.random() - 0.5);
		var y = force * (Math.random() - 0.5);
		Physic.applyForce(this.phyObj, {x:x, y:y})
	}
}

function _node_setAround(node) {
	this.moveStatus = 'around';
}

function _node_setUnAround(node) {
	this.moveStatus = 'float';
}

function _node_mouseEnter() {
	var node = Nodes.getNodeByUid(this.attr('uid'));
    node.displayAs('text');
}

function _node_mouseLeave() {
	// var node = Nodes.getNodeByUid(this.attr('uid'));
	// if(!node.onPath){
	// 	node.setStatus('dot');
	// }
}

function _node_mouseClick() {
	Nodes.clickNode(this.attr('uid'))
}

function _node_setStatic(isStatic) {
	Physic.setStatic(this.phyObj, isStatic)
}

function _node_moveTo(pos) {
	var node = this;
	this.onAnimate = true;
	var runner = this.ele.animate({
	  duration: 1000
	}).center(pos.x, pos.y);
	runner.after(function(e){
		node.onAnimate = false;
	})
}

function generateUid(){
	var _uidLength = 12;
	var _uidSoup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  	var soupLength = _uidSoup.length;
  	var id = []
  	for (var i = 0; i < _uidLength; i++) {
    	id[i] = _uidSoup.charAt(Math.random() * soupLength);
  	}
  	return id.join('')
}