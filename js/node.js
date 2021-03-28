var minNodeDistance = 100;

function Node(params){
	params.x = params.x || windowWidth * Math.random();
	params.y = params.y || windowHeight * Math.random();

	this.nid = params.nid;
	this.shape = null;
	this.ele = null;
	this.phyObj = null;
	this.links = [];
	this.status = {};

	this.onFrame = _node_onFrame;
	this.setNid = _node_setNid;
	this.addStatus = _nf_status_add;
	this.getStatus = _nf_status_get;
	this.setStatus = _nf_status_set;

	this.refreshLink = _nf_link_refresh;
	this.isLinked = _nf_link_islinked;
	this.moveTo = _nf_action_moveto;
	this.moveToArc = _nf_action_movetoarc;
	this.matching = _nf_action_matching;

	_nf_physic_initbody.call(this, params);
	_nf_shape_init.call(this, params);

	this.addStatus('stable',{value:false, updateHandler:_nf_statusupdate_stable});
	this.addStatus('stableCount',{value:-10});
	this.addStatus('position',{value:{x:params.x,y:params.y}, updateHandler:_nf_statusupdate_position});
	this.addStatus('text',{value:VReset, updateHandler:_nf_statusupdate_text, resetHandler:_nf_statusreset_text});
	this.addStatus('movement',{value:'float', updateHandler:_nf_statusupdate_movement, resetHandler:_nf_statusreset_movement});
	this.addStatus('linkNexts',{value:[], updateHandler:_nf_statusupdate_linknexts, resetHandler:_nf_statusreset_linknexts});
	this.addStatus('linkPrevs',{value:[], updateHandler:_nf_statusupdate_linkprevs, resetHandler:_nf_statusreset_linkprevs});
	this.addStatus('displayType',{value:'dot', updateHandler:_nf_statusupdate_displaytype, resetHandler:_nf_statusreset_displaytype, runUpdate:true});
	this.addStatus('onHover',{value:false, updateHandler:_nf_statusupdate_onhover});
	this.addStatus('onFocus',{value:false, updateHandler:_nf_statusupdate_onfocus});
	this.addStatus('onEdit',{value:false, updateHandler:_nf_statusupdate_onedit});
	this.addStatus('opacity',{value:1, updateHandler:_nf_statusupdate_opacity});

	// this.isLinked = _node_isLinked;
	// this.updatePrevLink = _node_updatePrevLink;

	// this.moveClose = _node_moveClose;
	// this.adjustDisplayToFocus = _node_adjustDisplayToFocus;

	// this.remove = _node_remove;
	// this.matchText = _node_matchText;
	// this.updateDisplayByScope = _node_updateDisplayByScope;
	// this.removeLinkOfNode = _node_removeLinkOfNode;
}

function _nf_shape_init(params){
	this.shape = draw.circle(Style.nodeShapeRadius).opacity(0).center(params.x, params.y);
	this.shape.insertBefore(drawAnchor1)
	this.shape.attr('nid',this.nid);
}

function _nf_status_add(name, params){
	var status = {}
	if(params.updateHandler){
		status.updateHandler = params.updateHandler;
	}
	if(params.resetHandler){
		status.resetHandler = params.resetHandler;
	}
	if(params.value == VReset){
		status.value = status.resetHandler(this);
	}else{
		status.value = params.value;
	}
	this.status[name] = status;
	if(params.runUpdate){
		status.updateHandler(this, status.value, status.value);
	}
}

function _nf_status_get(name){
	return this.status[name].value;
}


async function _nf_status_set(name, value, callback){
	value = value == VReset ? this.status[name].resetHandler(this) : value;
	var changed, valueKey;
	if(typeof value == 'object'){
		valueKey = _node_getStatusKey(name, value);
		changed = this.status[name].valueKey != valueKey;
	}else{
		changed = this.status[name].value != value
	}
	
	if(changed){
		if(valueKey){
			this.status[name].valueKey = valueKey;
		}
		var prevValue = this.status[name].value;
		this.status[name].value = value;
		if(this.status[name].updateHandler){
			this.status[name].updateHandler(this,prevValue,value,callback);
		}
	}
}

function _node_getStatusKey(name, value){
	if(name == 'linkNexts' || name == 'linkPrevs'){
		return _.map(value, function(v){
			return v.id + v.w; 
		}).join('-');
	}else if(name == 'position'){
		return value.x + ',' + value.y;
	}
}

function _node_onFrame(i) {

	// if(this.deleting){
	// 	return;
	// }
	//update pos
	// var x = this.shape.cx();
	// var y = this.shape.cy();
	var movementStatus = this.getStatus('movement')	
	if(movementStatus == 'float'){
		if(!this.getStatus('onHover') && this.getStatus('stable') && i % 25 == 0 && Math.random() > 0.9){
			var force = 0.1;
			var fx = force * (Math.random() - 0.5);
			var fy = force * (Math.random() - 0.5);
			Physic.applyForce(this.phyObj,{x:fx,y:fy})
		}
		x = this.phyObj.position.x;
		y = this.phyObj.position.y;
		var pos = this.getStatus('position');
		if(isNaN(x) || isNaN(y)){
			Physic.setPosition(this.phyObj, {x:pos.x,y:pos.y});
		}
		else{
			var diff = Math.abs(x - pos.x) + Math.abs(y - pos.y);
			if(diff > 0.05){
				this.setStatus('position',{x:x,y:y})
			}
		}
	}else if(movementStatus == 'animate'){
		this.setStatus('position',{x:this.shape.cx(),y:this.shape.cy()})
	}else if(movementStatus == 'static'){

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

function _node_adjustDisplayToFocus(){
	if(this.nid == Nodes.nFocus){

	}else if(this.isLinked(Nodes.nFocus.nid)){
		this.setStatus('around', Nodes.nFocus);
	}else{
		this.setStatus('float');
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