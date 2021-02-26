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
	node.links = [];

	node.onFrame = _node_onFrame;

	node.setText = _node_setText;
	node.setPos = _node_setPos;
	node.setStatus = _node_setStatus;
	node.displayAs = _node_displayAs;
	node.moveTo = _node_moveTo;

	node.linkTo = _node_linkTo;
	node.isLinked = _node_isLinked;

	//pos
	if(params.pos){
		node.posX = params.pos.x;
		node.posY = params.pos.y;
	}else{ 
		node.posX = windowWidth * Math.random();
		node.posY = windowHeight * Math.random();
	}

	
	if(!params.temp){
		node.float();
	}else{
		node.temp = true;
		node.uid = 'temp';
		node.displayAs('none');
	}
	
	//phyobj
	var isStatic = !node.temp;
	var size = !node.temp ? 12 : 0;
	node.phyObj = Physic.addCircle({
		x: node.posX,
		y: node.posY,
		r: size,
		isStatic: isStatic,
		frictionAir: 0.02,
		mass: 20
	});
	return node;
}

function _node_onFrame(i) {
	var d = 0;
	var x, y;
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
	}else if(this.status == 'around'){
		// var v = Matter.Vector.rotateAbout({x:this.posX, y:this.posY}, 0.0002, {x:this.centerNode.posX,y:this.centerNode.posY}) 
		// x = v.x;
		// y = v.y;

		// d += Math.abs(this.posX - x) + Math.abs(this.posY - y);
		// this.posX = x;
		// this.posY = y;
		if(this.ele.type == 'circle'){
			x = this.ele.cx();
			y = this.ele.cy();
		}
		if(this.ele.type == 'text'){
			x = this.ele.x();
			y = this.ele.y();
		}
		
		d += Math.abs(this.posX - x) + Math.abs(this.posY - y);
		Physic.setPosition(this.phyObj, {x:x,y:y});
		this.ele.center(this.posX, this.posY)
	}else if(this.status == 'float'){
		if(i % 25 == 0 & Math.random() > 0.9){
			var force = 0.1;
			var fx = force * (Math.random() - 0.5);
			var fy = force * (Math.random() - 0.5);
			Physic.applyForce(this.phyObj,{x:fx,y:fy})
		}

		x = this.phyObj.position.x;
		y = this.phyObj.position.y;
		if(this.posX != x || this.posY != y){
			d = d + Math.abs(this.posX - x) + Math.abs(this.posY - y);
			this.posX = x;
			this.posY = y;
			this.ele.center(this.posX, this.posY)
		}
	}else if(this.status == 'static'){
		// this.ele.center(this.posX, this.posY);
		// d += 1;
	}

	var _this = this;
	this.links.forEach(function(l){
		var node = l.node;
		if(l.x != node.posX || l.y != node.posY){
			l.x = node.posX;
			l.y = node.posY;
			l.line.plot(_this.posX, _this.posY, l.node.posX, l.node.posY);
		}
	})
	
	//update link
	if(d > 0.1){
		Nodes.updatingUids.push(this.uid)
	}
}

function _node_displayAs(type) {
	if(this.displayType != type){
		this.ele && this.ele.remove();
		var ele;
		if(type == 'dot'){
			ele = draw.circle(5).fill('#aaa').attr('uid',this.uid);
		}
		else if(type == 'text'){
			ele = draw.plain(Model.getText(this.nid)).fill('#666').font({size:12,anchor:'middle'}).attr('uid',this.uid);
		}else if(type == 'none'){
			ele = draw.circle(5).fill('#aaa').attr('uid',this.uid);
			ele.hide();
		}
		ele.on('mouseenter',_node_mouseEnter);
		ele.on('mouseleave',_node_mouseLeave);
		ele.on('click',_node_mouseClick);
		this.ele = ele;
	}
	this.ele.center(this.posX, this.posY).front();
	this.displayType = type;
}

function _node_focus() {
	this.moveStatus = 'static';
	this.posX = centerx;
	this.posY = centery;
	Comp.ring.show({x:this.posX,y:this.posY})
	this.displayAs('text');
	
}

function _node_unfocus(){
	this.rangeEle.remove();
	if(this.temp){
		this.displayAs('none');
	}else{
		this.displayAs('text');
	}
}

function _node_around(node) {
	this.moveStatus = 'around';
	this.centerNode = node;
	var v;
	if(this.posX == centerx && this.posY == centery){
		v = Matter.Vector.normalise({x:-1, y:0})
	}else{
		v = Matter.Vector.normalise({x:this.posX - centerx, y:this.posY - centery})
		
	}
	var l = 80 + 80 * Math.random();
	var x = centerx + v.x * l;
	var y = centery + v.y * l;
	
	this.displayAs('text');
	this.moveTo({x:x, y:y})
}

function _node_float() {
	this.moveStatus = 'float';
	this.centerNode = null;
	this.displayAs('dot');
	var l = Matter.Vector.magnitude({x:this.posX - centerx, y:this.posY - centery});
	if(l < 100){
		var v = Matter.Vector.normalise({x:this.posX - centerx, y:this.posY - centery})
		var l = 100 + 50 * Math.random();
		var x = centerx + v.x * l;
		var y = centery + v.y * l;
		this.moveTo({x:x, y:y})
	}
}

function _node_linkTo(node){
	var link = _node_getLinkByUid(this, node.uid);
	if(!link){
		link = {
			node : node,
			x: node.posX,
			y: node.posY
		}
		link.line = draw.line(this.posX, this.posY, node.posX, node.posY).stroke({ width: 0.2,color: 'red'});
		this.links.push(link)
	}
}

function _node_isLinked(uid){
	var link = _.find(this.links, function(l){
		return l.node.uid == uid;
	})
	return link ? true : false;
}

function _node_setText(text){
	if(this.ele.type == 'text'){
		this.ele.plain(text);
	}
}

function _node_setPos(pos){
	this.posX = pos.x;
	this.posY = pos.y;
	Physic.setPosition(this.phyObj, {x:this.posX,y:this.posY});
	this.ele.center(this.posX, this.posY)
}

function _node_setStatus(status){
	this.status = status;
	if(status == 'static'){

	}
}

function _node_getLinkByUid(node, uid){
	return _.find(node.links, function(l){
		return l.node.uid == uid;
	})
}

function _node_mouseEnter() {
	var node = Nodes.getNodeByUid(this.attr('uid'));
	if(!node.onAnimate){
		node.displayAs('text');
	}
}

function _node_mouseLeave() {
	// var node = Nodes.getNodeByUid(this.attr('uid'));
	// if(!node.onPath){
	// 	node.setStatus('dot');
	// }
}

function _node_mouseClick() {
	Nodes.focusNode(this.attr('uid'))
}

function _node_setStatic(isStatic) {
	Physic.setStatic(this.phyObj, isStatic)
}

function _node_moveTo(pos) {
	var node = this;
	this.onAnimate = true;
	var runner = this.ele.animate({
	  duration: 600
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