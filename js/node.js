var minNodeDistance = 100;

function BaseNode(params){
	this.nid = params.nid;
	this.moveStatus = '';
	this.displayType = '';
	this.ele = null;
	this.linkNexts = params.next || [];
	this.linkPrevs = params.prev || [];
	this.links = [];
	this.radius = 15;
	this.phyObj = Physic.addCircle({
		x: params.x,
		y: params.y,
		r: this.radius,
		isStatic: false,
		frictionAir: 0.02,
		mass: 20
	});
	this.shape = draw.circle(this.radius).opacity(0).center(params.x, params.y);
	this.shape.attr('nid',this.nid);
	this.shape.on('mouseenter',_node_mouseEnter);
	this._pos = {x:params.x,y:params.y}
	this.tempClock = 0;
	this.keepTempStatusTime = 25;
	this.onFrame = _node_onFrame;
	this.drawLink = _node_drawLink;
	this.initLinks = _node_initLinks;
	this.getLinkInfo = _node_getLinkInfo;
	this.getLink = _node_getLink;
	this.linkTo = _node_linkTo;
	this.isLinked = _node_isLinked;
	this.updatePrevLink = _node_updatePrevLink;
	this.setNid = _node_setNid;
	this.setText = _node_setText;
	this.setPos = _node_setPos;
	this.getPos = _node_getPos;
	this.moveTo = _node_moveTo;
	this.setStatus = _node_setStatus;
	this.displayAs = _node_displayAs;
	this.setOpacity = _node_setOpacity;
	this.setStatic = _node_setStatic;
	this.remove = _node_remove;
	this.updateDistanceByText = _node_updateDistanceByText;
	this.updateDisplayByScope = _node_updateDisplayByScope;
	this.removeLinkOfNode = _node_removeLinkOfNode;
}

function Node(params){
	params.x = params.x || windowWidth * Math.random();
	params.y = params.y || windowHeight * Math.random();
	
	var node = new BaseNode(params);
	var displayAs = params.displayAs || 'text';
	node.displayAs(displayAs);
	node.setPos(params.x,params.y)
	
	var status = params.status || 'float';
	node.setStatus(status);
	return node;
}

function _node_onFrame(i) {
	var x = this.shape.cx();
	var y = this.shape.cy();

	if(this.onAnimate){

	}else if(this.animateDone){
		this.needUpdate = true;
		this.animateDone = false;
		Physic.setPosition(this.phyObj, {x:x,y:y});
	}
	else if(this.status == 'around'){

	}else if(this.status == 'float'){
		if(i % 25 == 0 & Math.random() > 0.9){
			var force = 0.1;
			var fx = force * (Math.random() - 0.5);
			var fy = force * (Math.random() - 0.5);
			Physic.applyForce(this.phyObj,{x:fx,y:fy})
		}
		x = this.phyObj.position.x;
		y = this.phyObj.position.y;
		this.shape.center(x, y)
	}else if(this.status == 'static'){

	}

	//sync pos
	var posDiff = Math.abs(x - this._pos.x) + Math.abs(y - this._pos.y);
	if(posDiff > 0){
		this.ele.center(x, y);
		if(this.status != 'float'){
			Physic.setPosition(this.phyObj, {x:x,y:y});
		}
	}
	this._pos.x = x;
	this._pos.y = y;
	
	//update link
	if(posDiff > 0.25 || this.needUpdate){
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

	// if(this.tempClock > 0){
	// 	this.tempClock--;
	// 	if(this.tempClock == 0 && this.displayType == 'tempText'){
	// 		this.displayAs('dot');
	// 	}
	// }
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
		link.w = 1;
		this.links.push(link)
	}else{
		link.plot(pos.x, pos.y, pos2.x, pos2.y);
		if(increase){
			link.w += increase;
		}
	}
}

function _node_updatePrevLink(prevNode, increase){
	var link = _.find(this.linkPrevs, function(l){
		return l.id == prevNode.nid;
	})
	if(!link){
		link = {
			id : prevNode.nid,
			w : 1
		}
		this.linkPrevs.push(link)
	}
	else if(increase){
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
	this.drawLink(node, 0);
	node.updatePrevLink(this, 0)
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
	return {x:this.shape.cx(),y:this.shape.cy()}
}

function _node_getElePos(){
	var x,y;
	if(!this.ele){
		x = this.shape.cx();
		y = this.shape.cy();
	}
	else if(this.ele.type == 'circle'){
		x = this.ele.cx();
		y = this.ele.cy();
	}
	else if(this.ele.type == 'text'){
		x = this.ele.attr('x');
		y = this.ele.attr('y');
	}
	return {x:x,y:y}
}

function _node_displayAs(type) {
	var text = this.nid ? Model.getText(this.nid) : Entry.ele.val();
	if(this.displayType != type){
		this.displayType = type;
		this.ele && this.ele.remove();
		var ele;
		if(type == 'dot'){
			ele = draw.circle(5).fill('#aaa');
		}else if(type == 'text'){
			ele = draw.plain(text).fill('#666').font({size:12,anchor:'middle'});
			ele.on('mouseleave',_node_mouseLeave);
			ele.on('click',_node_mouseClick);
		}else if(type == 'tempText'){
			ele = draw.plain(text).fill('#666').font({size:12,anchor:'middle'});
			this.tempClock = this.keepTempStatusTime;
		}else if(type == 'none'){
			ele = draw.circle(5).fill('#aaa');
			ele.hide();
		}
		ele.attr('nid',this.nid);
		this.ele = ele;
		this.ele.center(this.shape.cx(), this.shape.cy()).front();
	}
	if(this.displayType == 'text' || this.displayType == 'tempText'){
		this.setText(text)
	}
}

function _node_setText(text){
	if(this.ele.type == 'text'){
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
		this.setStatic(true)
	}
}

function _node_setOpacity(opacity){
	this.ele.opacity(opacity)
}

function setStatic(static){
	Physic.setStatic(this.phyObj, static);
}

function _node_mouseEnter(e) {
	var node = Nodes.getNodeByNid(this.attr('nid'));
	if(!node.onAnimate){
		node.displayAs('text');
	}
}

function _node_mouseLeave(e) {
	var node = Nodes.getNodeByNid(this.attr('nid'));
	if(node.status == 'float'){
		node.displayAs('dot');
	}
	return false;
}

function _node_mouseClick() {
	Nodes.handleNodeNext('node',this.attr('nid'))
}

function _node_setStatic(isStatic) {
	Physic.setStatic(this.phyObj, isStatic)
}

function _node_updateDistanceByText(node){
	var text1 = this.getText();
	var text2 = node.getText();
	var matched = text1.indexOf(text2) >= 0 || text2.indexOf(text1) >= 0;
	if(matched){
		this.displayAs('text');
	}else{
		this.displayAs('dot');
	}
}

function _node_updateDisplayByScope(){
	if(this.tempClock > 0){
		return;
	}
	if(!Comp.scope.visible && this.displayType == 'tempText'){
		this.displayAs('dot')
		return;
	}
	var isInside = Comp.scope.inside(this.getPos());
	if(isInside && this.displayType == 'dot'){
		this.displayAs('tempText')
	}
	else if(!isInside && this.displayType == 'tempText'){
		this.displayAs('dot')
	}
}

function _node_removeLinkOfNode(nid){
	var n = {};
	var len = this.links.length;
	this.links = _.filter(this.links, function(l){
		if(l.nextNode.nid == nid){
			l.remove();
			l.nextNode = null;
			return false;
		}else{
			return true;
		}
	})
	this.linkPrevs = _.filter(this.linkPrevs, function(l){
		return l.id != nid;
	})
}

function _node_remove(){
	this.ele.remove();
	this.links.forEach(function(l){
		l.nextNode = null;
		l.remove();
	})
	Physic.deleteObject(this.phyObj);
}

function _node_moveTo(pos, duration, callback) {
	var node = this;
	this.onAnimate = true;
	duration = duration || 400;
	var runner = this.shape.animate({
	  duration: duration
	}).center(pos.x, pos.y);
	runner.after(function(e){
		node.onAnimate = false;
		node.animateDone = true;
		callback && callback(node);
	})
}

function _node_setNid(nid){
	this.nid = nid;
	this.ele.attr('nid', nid);
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