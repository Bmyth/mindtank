var minNodeDistance = 100;

function BaseNode(params){
	this.nid = params.nid;
	this.text = this.nid ? Model.getText(this.nid) : '';
	this.moveStatus = '';
	this.displayType = '';
	this.ele = null;
	this.linkPrevs = [];
	this.links = [];
	this.radius = 10;
	this.style = {
		dotColor : '#aaa',
		fontColor : '#666',
		fontHoverColor : '#333'
	}
	this.phyObj = Physic.addCircle({
		x: params.x,
		y: params.y,
		r: this.radius,
		isStatic: false,
		frictionAir: 0.02,
		mass: 20
	});
	this.shape = draw.circle(this.radius).opacity(0).center(params.x, params.y);
	this.shape.insertBefore(drawAnchor1)
	this.shape.attr('nid',this.nid);
	this.shape.on('mouseenter',_node_mouseEnterShape);
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
	this.moveClose = _node_moveClose;
	this.setStatus = _node_setStatus;
	this.displayAs = _node_displayAs;
	this.setOpacity = _node_setOpacity;
	this.setStatic = _node_setStatic;
	this.remove = _node_remove;
	this.onHover = _node_onHover;
	this.matchText = _node_matchText;
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
	if(this.deleting){
		return;
	}
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
		if(!this.onHover() && i % 25 == 0 && Math.random() > 0.9){
			var force = 0.1;
			var fx = force * (Math.random() - 0.5);
			var fy = force * (Math.random() - 0.5);
			Physic.applyForce(this.phyObj,{x:fx,y:fy})
		}
		x = this.phyObj.position.x;
		y = this.phyObj.position.y;
		if(isNaN(x) || isNaN(y)){
			x = this.shape.cx();
			y = this.shape.cy();
			Physic.setPosition(this.phyObj, {x:x,y:y});
		}else{
			this.shape.center(x, y)
		}
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
			_this.drawLink(l.nextNode, {link:l});
		})
		this.linkPrevs.forEach(function(l){
			var node = Nodes.getNodeByNid(l.id);
			node.drawLink(_this);
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
	this.links.forEach(function(l){
		l.line.remove();
	})
	var n = Model.getNodeById(this.nid);

	this.links = [];
	this.linkPrevs = n.prev;
	n.next.forEach(function(next){
		var nextNode = Nodes.getNodeByNid(next.id);
		_this.drawLink(nextNode, {w:next.w});
	})
}

function _node_drawLink(node, params){
	params = params || {};
	var link = params.link || this.getLink(node.nid);
	var pos = this.getPos();
	var pos2 = node.getPos();
	if(!link){
		var line = draw.line(pos.x, pos.y, pos2.x, pos2.y).stroke({ width: 0.1,color: '#666'});
		line.insertBefore(drawAnchor2)
		link = {
			line: line,
			nextNode: node,
			w: params.w || 1
		}
		this.links.push(link)
	}else{
		link.line.plot(pos.x, pos.y, pos2.x, pos2.y);
		if(params.wAdd){
			link.w += params.wAdd;
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
	this.drawLink(node);
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
	if(this.displayType != type){
		this.displayType = type;
		this.ele && this.ele.remove();
		var ele;
		if(type == 'dot'){
			ele = draw.circle(5).fill(this.style.dotColor);
		}else if(type == 'text'){
			ele = draw.plain(this.text).fill(this.style.fontColor).font({size:12,anchor:'middle'});
			ele.insertAfter(drawAnchor5)
			ele.on('mouseenter',_node_mouseEnterText);
			ele.on('mouseleave',_node_mouseLeaveText);
			ele.on('click',_node_mouseClick);
		}else if(type == 'tempText'){
			ele = draw.plain(this.text).fill(this.style.fontColor).font({size:12,anchor:'middle'});
			ele.insertAfter(drawAnchor5)
			ele.on('click',_node_mouseClick);
			this.tempClock = this.keepTempStatusTime;
		}else if(type == 'none'){
			ele = draw.circle(1).fill('#fff');
			ele.hide();
		}
		ele.attr('nid',this.nid);
		this.ele = ele;
		this.ele.center(this.shape.cx(), this.shape.cy());
	}else{
		this.ele.attr('nid',this.nid);
		this.ele.center(this.shape.cx(), this.shape.cy());
	}
}

function _node_setText(text){
	this.text = text;
	if(this.ele.type == 'text'){
		this.ele.plain(text);
	}
}

function _node_setStatus(status, params){
	this.status = status;
	if(status == 'float'){
		this.centerNode = null;
		this.setStatic(false)
		//this.displayAs('dot');
		this.displayAs('text');
		var pos = this.getPos();
		var l = Matter.Vector.magnitude({x:pos.x - centerX, y:pos.y - centerY});
		if(l < Comp.ring.outerRadius){
			var v;
			if(l < 0.1){
				v = Matter.Vector.normalise({x:Math.random() - 0.5, y:Math.random() - 0.5})
			}else{
				v = Matter.Vector.normalise({x:pos.x - centerX, y:pos.y - centerY})
			}
			
			var l = Comp.ring.outerRadius + 100 * Math.random();
			var x = centerX + v.x * l;
			var y = centerY + v.y * l;
			this.moveTo({x:x, y:y})
		}
	}
	if(status == 'matched'){
		this.displayAs('dot');
		this.moveTo({x:params.x, y:params.y},400,function(node){
			node.setOpacity(0);
			node.setStatic(true)
		})
		
	}
	if(status == 'unmatched'){
		this.status = 'float'
		this.displayAs('dot');
		this.setOpacity(1);
		var v = Matter.Vector.normalise({x:Math.random() - 0.5, y:Math.random() - 0.5})
		var r = Comp.ring.outerRadius + 100;
		this.moveTo({x:centerX + v.x * r, y:centerY + v.y * r})
		this.setStatic(false)
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
	if(status == 'static'){
		this.setStatic(true)
	}
}

function _node_setOpacity(opacity){
	this.ele.opacity(opacity)
}

function setStatic(static){
	Physic.setStatic(this.phyObj, static);
}

function _node_mouseEnterShape(e) {
	var node = Nodes.getNodeByNid(this.attr('nid'));
	if(!node.onAnimate && node.displayType == 'dot'){
		node.displayAs('text');
		node.setStatic(true);
	}
}

function _node_mouseLeave(e) {
	var node = Nodes.getNodeByNid(this.attr('nid'));
	if(node.status == 'float'){
		node.displayAs('dot');
		node.setStatic(false);
	}
	return false;
}

function _node_mouseEnterText(e){
	var node = Nodes.getNodeByNid(this.attr('nid'));
	node.ele.fill(node.style.fontHoverColor);
	Nodes.nHover = node;
}

function _node_mouseLeaveText(e){
	var node = Nodes.getNodeByNid(this.attr('nid'));
	node.ele.fill(node.style.fontColor);
	if(node.status == 'float'){
		node.displayAs('dot');
		node.setStatic(false);
	}
	Nodes.nHover = null;
}

function _node_mouseClick() {
	Nodes.handleNodeNext('node',this.attr('nid'))
}

function _node_setStatic(isStatic) {
	Physic.setStatic(this.phyObj, isStatic)
}

function _node_matchText(node){
	if(this.displayType == 'text'){
		return;
	}
	var equal = node.text == this.text;
	var matched = equal || (node.text.length < 2 ? false : (this.text.indexOf(node.text) >= 0));
	
	if(this.status == 'matched' && !equal){
		this.setStatus('unmatched');
	}
	if(equal){
		this.setStatus('matched', node.getPos())
	}else if(matched && this.displayType == 'dot'){
		this.displayAs('tempText');
		this.moveClose(node.getPos())
	}else if(!matched && this.displayType == 'tempText'){
		this.displayAs('dot')
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
	var matched = false;
	var link = this.getLink(nid);
	if(link){
		link.line.remove();
	}
	this.links = _.filter(this.links, function(l){
		return l.nextNode.nid != nid
	})
	
	this.linkPrevs = _.filter(this.linkPrevs, function(l){
		return l.id != nid;
	})
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

function _node_moveClose(pos, force){
	if(this.status == 'float'){
		var pos = this.getPos();
		var v = Matter.Vector.normalise({x:pos.x - centerX, y:pos.y - centerY})
		force = force || 0.1;
		var fx = force * -v.x;
		var fy = force * -v.y;
		Physic.applyForce(this.phyObj,{x:fx,y:fy})
	}
}

function _node_remove(callback){
	var node = this;
	this.deleting = true;
	// this.displayAs('dot');
	// this.shape.off('mouseenter');
	// this.ele.off('mouseenter');
	// this.ele.off('mouseleave');
	this.links.forEach(function(l){
		l.nextNode = null;
		l.line.remove();
	})
	this.links = [];

	Nodes.items.forEach(function(n){
		n.removeLinkOfNode(node.nid);
	})
	Physic.deleteObject(this.phyObj);

	var runner = this.ele.animate({
	  duration: 400
	}).opacity(0);
	runner.after(function(e){
		node.shape.remove();
		node.ele.remove();
		callback && callback(node);
	})
}

function _node_setNid(nid){
	this.nid = nid;
	this.shape.attr('nid', nid);
	this.ele.attr('nid', nid);
}

function _node_onHover(){
	return Nodes.nHover && Nodes.nHover.nid == this.nid;
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