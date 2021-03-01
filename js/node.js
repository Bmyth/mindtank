var minNodeDistance = 100;

function BaseNode(params){
	this.nid = params.nid;
	this.moveStatus = '';
	this.displayType = '';
	this.ele = null;
	this.linkNexts = params.next || [];
	this.linkPrevs = params.prev || [];
	this.links = [];
	this.phyObj = Physic.addCircle({
		x: params.x,
		y: params.y,
		r: 12,
		isStatic: false,
		frictionAir: 0.02,
		mass: 20
	});
	this.prevPos = {x:params.x,y:params.y}

	this.onFrame = _node_onFrame;
	this.drawLink = _node_drawLink;
	this.initLinks = _node_initLinks;
	this.getLinkInfo = _node_getLinkInfo;
	this.getLink = _node_getLink;
	this.linkTo = _node_linkTo;
	this.isLinked = _node_isLinked;
	this.updatePrevLink = _node_updatePrevLink;
	this.setText = _node_setText;
	this.setPos = _node_setPos;
	this.getPos = _node_getPos;
	this.setStatus = _node_setStatus;
	this.displayAs = _node_displayAs;
	this.moveTo = _node_moveTo;
}

function Node(params){
	params.x = params.x || windowWidth * Math.random();
	params.y = params.y || windowHeight * Math.random();
	
	var node = new BaseNode(params);
	var displayAs = params.displayAs || 'dot';
	node.displayAs(displayAs);
	node.setPos(params.x,params.y)
	
	var status = params.status || 'float';
	node.setStatus(status);
	return node;
}

function _node_onFrame(i) {
	var d = 0;
	var x, y;
	var pos = this.getPos();
	//move
	if(this.onAnimate){
		Physic.setPosition(this.phyObj, {x:pos.x,y:pos.y});
	}else if(this.animateDone){
		Physic.setPosition(this.phyObj, {x:pos.x,y:pos.y});
		this.needUpdate = true;
		this.animateDone = false;
	}
	else if(this.status == 'around'){
		// var v = Matter.Vector.rotateAbout({x:this.posX, y:this.posY}, 0.0002, {x:this.centerNode.posX,y:this.centerNode.posY}) 
		// x = v.x;
		// y = v.y;
	}else if(this.status == 'float'){
		if(i % 25 == 0 & Math.random() > 0.9){
			var force = 0.1;
			var fx = force * (Math.random() - 0.5);
			var fy = force * (Math.random() - 0.5);
			Physic.applyForce(this.phyObj,{x:fx,y:fy})
		}

		pos.x = this.phyObj.position.x;
		pos.y = this.phyObj.position.y;
		this.ele.center(pos.x, pos.y)
	}else if(this.status == 'static'){

	}

	var posDiff = Math.abs(pos.x - this.prevPos.x) + Math.abs(pos.y - this.prevPos.y);
	this.prevPos.x = pos.x;
	this.prevPos.y = pos.y;
	
	//update link
	if(posDiff > 0.1 || this.needUpdate){
		this.needUpdate = false;
		var _this = this;
		this.links.forEach(function(l){
			_this.drawLink(l.nextNode, 0 , l);
		})
		this.linkPrevs.forEach(function(l){
			var node = Nodes.getNodeByNid(l.id);
			node.drawLink(_this, 0);
		})
	}
}

function _node_initLinks(){
	var _this = this;
	this.links = [];
	var pos = this.getPos();
	this.linkNexts.forEach(function(next){
		var nextNode = Nodes.getNodeByNid(next.id, next.w);
		_this.drawLink(nextNode);
	})
}

function _node_drawLink(node, increase, link){
	var link = link || this.getLink(node.nid);
	var pos = this.getPos();
	var pos2 = node.getPos();
	if(!link){
		link = draw.line(pos.x, pos.y, pos2.x, pos2.y).stroke({ width: 0.1,color: '#333'});
		link.nextNode = node;
		link.w = 0;
		this.links.push(link)
	}else{
		link.plot(pos.x, pos.y, pos2.x, pos2.y);
	}
	if(increase){
		link.w += increase;
	}
}

function _node_updatePrevLink(prevNode, increase){
	var link = _.find(this.linkPrevs, function(l){
		return l.id == prevNode.nid;
	})
	if(!link){
		link = {
			id : prevNode.nid,
			w : 0
		}
		this.linkPrevs.push(link)
	}
	if(increase){
		link.w += increase;
	}
}

function _node_getLinkInfo(){
	var next = _.map(this.links, function(l){
		return {id: l.nextNode.nid, w: l.w}
	})
	var prev = this.linkPrevs;
	return {
		next : next,
		prev : prev
	}
}

function _node_getLink(nid){
	return _.find(this.links, function(l){
		return l.nextNode.nid == nid;
	})
}

function _node_linkTo(node){
	this.drawLink(node, 1);
	node.updatePrevLink(this, 1)
}

function _node_isLinked(nid){
	var link = _.find(this.links, function(l){
		return l.nextNode.nid == nid;
	})
	if(link){
		return 'next';
	}
	link = _.find(this.linkPrevs, function(l){
		return l.id == nid;
	})
	if(link){
		return 'prev';
	}
	return false;
}

function _node_setPos(x,y){
	if(this.ele){
		this.ele.center(x, y);
	}
	if(this.phyObj){
		Physic.setPosition(this.phyObj, {x:x,y:y});
	}
}	

function _node_getPos(){
	var x,y;
	if(!this.ele){
		return null;
	}
	if(this.ele.type == 'circle'){
		x = this.ele.cx();
		y = this.ele.cy();
	}
	if(this.ele.type == 'text'){
		x = this.ele.attr('x');
		y = this.ele.attr('y');
	}
	return {x:x,y:y}
}

function _node_displayAs(type) {
	if(this.displayType != type){
		this.displayType = type;
		this.ele && this.ele.remove();
		var ele;
		if(type == 'dot'){
			ele = draw.circle(5).fill('#aaa');
		}
		else if(type == 'text'){
			ele = draw.plain(text).fill('#666').font({size:12,anchor:'middle'});
		}else if(type == 'none'){
			ele = draw.circle(5).fill('#aaa');
			ele.hide();
		}
		ele.attr('nid',this.nid);
		ele.on('mouseenter',_node_mouseEnter);
		ele.on('mouseleave',_node_mouseLeave);
		ele.on('click',_node_mouseClick);
		this.ele = ele;
	}
	if(this.displayType == 'text'){
		var text = (!!this.nid ? Model.getText(this.nid) : Entry.ele.val()) || '_';	
		this.ele.plain(text)
	}
	this.ele.center(this.prevPos.x, this.prevPos.y).front();
}

function _node_setText(text){
	if(this.ele.type == 'text'){
		var text = (this.nid ? text : Entry.ele.val()) || '_';
		this.ele.plain(text);
	}
}

function _node_setStatus(status, params){
	this.status = status;
	if(status == 'float'){
		this.centerNode = null;
		this.displayAs('dot');
		var pos = this.getPos();
		var l = Matter.Vector.magnitude({x:pos.x - centerX, y:pos.y - centerY});
		if(l < Comp.ring.outerRadius){
			var v = Matter.Vector.normalise({x:pos.x- centerX, y:pos.y - centerY})
			var l = Comp.ring.outerRadius + 100 * Math.random();
			var x = centerX + v.x * l;
			var y = centerY + v.y * l;
			this.moveTo({x:x, y:y})
		}
	}
	if(status == 'around'){
		this.centerNode = params;
		var v;
		var pos = this.getPos();
		if(pos.x == centerX && pos.y == centerY){
			v = Matter.Vector.normalise({x:-1, y:0})
		}else{
			v = Matter.Vector.normalise({x:pos.x - centerX, y:pos.y - centerY})
			
		}
		var l = 80 + 80 * Math.random();
		var x = centerX + v.x * l;
		var y = centerY + v.y * l;
		
		this.displayAs('text');
		this.moveTo({x:x, y:y})
	}
}

function _node_getLinkByUid(node, uid){
	return _.find(node.links, function(l){
		return l.node.uid == uid;
	})
}

function _node_mouseEnter() {
	var node = Nodes.getNodeByNid(this.attr('nid'));
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
	Nodes.handleNodeNext('node',this.attr('nid'))
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
		node.animateDone = true;
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