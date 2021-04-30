//--------------------------------------move----------------------------------------------
function _nf_action_moveto(params){
	var pos = params.pos;
	var duration = params.duration || 400;
	var node = this;
	this.setStatus('movement','animate');
	var runner = this.shape.animate({
	  duration: duration
	}).center(pos.x, pos.y);
	runner.after(function(e){
		node.setStatus('position', pos);
		node.resetStatus('movement');
		params.callback && params.callback(node);
	})
}

function _nf_action_movetoarc(params){
	params = params || {};
	var center = params.centerPoint || centerPoint;
	var relatePoint = params.relatePoint;
	var v = Matter.Vector.normalise({x:relatePoint.x - center.x, y:relatePoint.y - center.y});
	if(v.x == 0 && v.y == 0){
		v = Matter.Vector.normalise({x:1, y:0})
	}

	var degree = params.degree || 0;
	
	if(params.degreeOffRange != undefined){
		degree += params.degreeOffRange[0] + Math.random() * (params.degreeOffRange[1] - params.degreeOffRange[0]); 
	}
	degree = degree * (Math.PI/180);
	v = Matter.Vector.rotate(v, degree);
	var radius = params.radius;
	if(params.radiusOffRange != undefined){
		radius += params.radiusOffRange[0] + Math.random() * (params.radiusOffRange[1] - params.radiusOffRange[0]); 
	}
	params.pos = {x:center.x + v.x * radius,y:center.y + v.y * radius};
	this.moveTo(params);
}

//--------------------------------------status----------------------------------------------
function _nf_statusreset_linknexts(node){
	if(!node.nid){
		return [];
	}
	var n = Model.getNodeById(node.nid);
	return n ? n.next : [];
}

function _nf_statusreset_linkprevs(node){
	if(!node.nid){
		return [];
	}
	var n = Model.getNodeById(node.nid);
	return n ? n.prev : [];
}

function _nf_statusreset_text(node){
	return text = node.nid ? Model.getText(node.nid) : '';
}

function _nf_statusupdate_displaytype(node, prevValue,value) {
	node.ele && node.ele.remove();
	var ele;
	if(value == 'dot'){
		ele = draw.circle(5).fill(Style.nodeDotColor);
	}else if(value == 'text'){
		var size = node.getStatus('onFocus') ? Style.nodeTextSizeOnFocus : Style.nodeTextSize;
		ele = draw.plain(node.getStatus('text')).fill(Style.nodeTextColor).font({size:size,anchor:'middle'});
		ele.insertAfter(drawAnchor5)
		ele.on('mouseenter',_nf_mouse_entertext);
		ele.on('mouseleave',_nf_mouse_leavetext);
		ele.on('click',_nf_mouse_clicktext);
	}else if(value == 'none'){
		ele = draw.circle(1).fill('#fff');
		ele.hide();
	}
	ele.attr('nid',node.nid);
	node.ele = ele;
	var pos = node.getStatus('position');
	node.ele.center(pos.x, pos.y);
}

function _nf_statusupdate_linknexts(node, prevValue,value) {
	var _this = node;
	value.forEach(function(nextLinkData){
		var nextNode = Nodes.getNodeByNid(nextLinkData.id);
		_nf_link_refresh.call(_this, {data:nextLinkData, nextNode:nextNode})
	})
	var diff = _nf_link_diff(prevValue,value,'1');
	diff.forEach(function (d) {
		_nf_link_remove(d.id);
		var nextNode = Nodes.getNodeByNid(d.id);
		nextNode && nextNode.setStatus('linkPrevs',VReset);
	})
	diff = _nf_link_diff(prevValue,value,'2');
	diff.forEach(function (d) {
		var nextNode = Nodes.getNodeByNid(d.id);
		nextNode && nextNode.setStatus('linkPrevs',VReset);
	})
}

function _nf_statusupdate_linkprevs(node, prevValue,value) {
	var diff = _nf_link_diff(prevValue,value,'all');
	diff.forEach(function(d){
		var prevNode = Nodes.getNodeByNid(d.id);
		prevNode && prevNode.setStatus('linkNexts',VReset);
 	})
}

function _nf_statusupdate_movement(node, prevValue,value) {
	if(value == 'static'){
		Physic.setStatic(node.phyObj, true);
	}else if(value == 'float'){
		Physic.setStatic(node.phyObj, false);
	}

	if(prevValue == 'animate'){
		_nf_link_refreshall.call(node);
	}
}

function _nf_statusupdate_onhover(node, prevValue,value){
	if(value){
		Nodes.nHover = node;
		if(node.getStatus('displayType') == 'dot'){
			node.setStatus('displayType','text');
		}
	}else{
		node.resetStatus('displayType');
		// node.setStatus('movement',VReset);
		Nodes.nHover = null;
	}
}

function _nf_statusupdate_onedit(node, prevValue,value){
	if(value){
		if(Nodes.nEdit && Nodes.nEdit.nid != node.nid){
			Nodes.nEdit.setStatus('onEdit',false);
		}
		node.setStatus('opacity',0);
		node.setStatus('phyMask',PhysicFilter.default)
		Nodes.nEdit = node;
		Entry.show();
	}else{
		node.setStatus('opacity',1);
		node.setStatus('phyMask',PhysicFilter.default|PhysicFilter.node)
		Nodes.nEdit = null;
		Entry.hide();
	}
	Nodes.refresh();
}

function _nf_statusupdate_onfocus(node, prevValue,value){
	if(value){
		if(Nodes.nFocus  && Nodes.nFocus.nid != node.nid){
			Nodes.nFocus.setStatus('onFocus',false);
		}
		Nodes.nFocus = node;
	}else{
		Nodes.nFocus = null;
	}
	_nf_statusupdate_displaytype(node, '', node.getStatus('displayType'))
	Nodes.refresh();
}

function _nf_statusupdate_opacity(node, prevValue,value){
	if(node.ele){
		var pos = node.getStatus('position');
		node.ele.center(pos.x, pos.y)
		node.ele.opacity(value);
	}
}


function _nf_statusupdate_phymask(node, prevValue, value){
	if(value){
		Physic.setMask(node.phyObj, value);
	}
}

function _nf_statusupdate_position(node, prevValue,value) {
	var posDiff = prevValue  == null ? 1 :  Math.abs(prevValue.x - value.x) + Math.abs(prevValue.y - value.y);
	
	//sync pos
	if(posDiff > 0){
		if(node.ele){
			node.ele.center(value.x, value.y)
		}
		if(node.getStatus('movement') != 'float'){
			Physic.setPosition(node.phyObj, {x:value.x,y:value.y});
		}
		if(node.getStatus('movement') != 'animate'){
			node.shape.center(value.x, value.y)
		}
	}

	//update link
	if(posDiff > 0.1){
		_nf_link_refreshall.call(node);
	}
}

function _nf_statusupdate_text(node, prevValue,value) {
	if(node.getStatus('displayType') == 'text'){
		node.ele.plain(value)
	}
	if(node.getStatus('onEdit')){
		Nodes.items.forEach(function(n){
			n.resetStatus();
		})
	}
}

//--------------------------------------link----------------------------------------------
function _nf_link_add(node){
	var _this = this; 	
	var linkNexts = this.getStatus('linkNexts');
	var linkNext = _.find(linkNexts, function(l){
		return l.id == node.nid;
	})
	if(!linkNext){
		linkNext = {
			id : node.nid || '',
			w : 1
		}
		linkNexts.push(linkNext);
		this.setStatus('linkNexts', linkNexts);
	}else{
		linkNext.w += 1;
	}
	var linkPrevs = node.getStatus('linkPrevs');
	var linkPrev = _.find(linkPrevs, function(l){
		return l.id == _this.nid;
	})
	if(!linkPrev){
		linkPrev = {
			id : _this.nid || '',
			w : 1
		}
		linkPrevs.push(linkPrev);
		node.setStatus('linkPrevs', linkPrevs);
	}else{
		linkPrev.w += 1;
	}
	this.refreshLink({nextNode:node});
}

function _nf_link_remove(nid){
	var link = _.find(this.links, function(l){
		return l.nextNode.nid == nid;
	});
	if(link){
		link.line.remove();
		var nextNode = link.nextNode;
		if(link.constraint){
			Physic.deleteObject(link.constraint);
		}
		this.links = _.filter(this.links, function(l){
			return l.nextNode.nid == nid
		})

		var linkNexts = _.filter(this.getStatus('linkNexts'), function(l){
			return l.id != nid;
		})
		this.setStatus('linkNexts', linkNexts);

		var linkPrevs = _.filter(nextNode.getStatus('linkPrevs'), function(l){
			return l.id != nid;
		})
		nextNode.setStatus('linkPrevs', linkPrevs);
		//save
	}
}


function _nf_link_refresh(params){
	params = params || {};
	var nextNode = params.nextNode;
	var link = params.link || _nf_link_get.call(this, nextNode.nid);
	var pos = this.getStatus('position');
	var pos2 = nextNode.getStatus('position');
	if(!link){
		var line = draw.line(pos.x, pos.y, pos2.x, pos2.y).stroke({ width: 0.1,color: Style.nodeLinkColor});
		line.insertBefore(drawAnchor2)
		link = {
			line: line,
			nextNode: nextNode,
			w: params.w || 1
		}
		this.links.push(link)
	}else{
		link.line.plot(pos.x, pos.y, pos2.x, pos2.y);
		if(params.wAdd){
			link.w += params.wAdd;
		}
	}
	
	// _nf_physic_refreshconstraint.call(this, nextNode, link);
}

function _nf_link_get(nextNid){
	return _.find(this.links, function(l){
		return l.nextNode.nid == nextNid;
	})
}

function _nf_link_islinked(nid){
	var link = _.find(this.getStatus('linkNexts'), function(l){
		return l.id == nid;
	})
	if(link){
		return 'next';
	}
	link = _.find(this.getStatus('linkPrevs'), function(l){
		return l.id == nid;
	})
	if(link){
		return 'prev';
	}
	return false;
}

function _nf_link_refreshall(){
	var node = this;
	this.links.forEach(function(l){
		node.refreshLink({nextNode: l.nextNode, link:l});
	})
	var prevlinks = this.getStatus('linkPrevs');
	prevlinks.forEach(function(l){
		var prevNode = Nodes.getNodeByNid(l.id);
		prevNode.refreshLink({nextNode:node});
	})
}

//--------------------------------------physic----------------------------------------------
function _nf_physic_refreshconstraint(toNode, link){
	if(!link.constraint){
		l = 100;
		constraint = Physic.addConstraint(this.phyObj, toNode.phyObj, {length: l});
		constraint.at = this.nid;
		constraint.to = toNode.nid;
		link.constraint = constraint;
	}
}

//--------------------------------------mouse----------------------------------------------
function _nf_mouse_enterdot(e){

}

function _nf_mouse_entershape(e){
	var node = Nodes.getNodeByNid(this.attr('nid'));
	if(!node.getStatus('movement') != 'animate' && node.getStatus('displayType') == 'dot'){
		node.setStatus('onHover',true);
	}
}

function _nf_mouse_entertext(){

}

function _nf_mouse_leavetext(e){
	var node = Nodes.getNodeByNid(this.attr('nid'));
	if(node.getStatus('onHover')){
		node.setStatus('onHover',false);
	}
}

function _nf_mouse_clicktext(){
	Nodes.handleNodeNext('node',this.attr('nid'))
}

//--------------------------------------miscellaneous----------------------------------------------
function _nf_init_shape_and_phyobj(params){
	this.shape = draw.circle(Style.nodeShapeRadius).opacity(0).center(params.x, params.y);
	this.shape.insertBefore(drawAnchor1)
	this.shape.attr('nid',this.nid);
	this.shape.on('mouseenter',_nf_mouse_entershape);

	this.phyObj = Physic.addCircle({
		x: params.x,
		y: params.y,
		r: Style.nodeShapeRadius,
		isStatic: false,
		frictionAir: 0.4,
		mass: 20
	});
}

function _nf_link_diff(list1,list2,type) {
	var diff = [];
	if(type == '1' || type == 'all'){
		list1.forEach(function(i) {
			var exist = _.find(list2, function(j) {
				return i.id == j.id
			})
			if(!exist){
				diff.push(i)
			}
		})
	}
	if(type == '2' || type == 'all'){
		list2.forEach(function(i) {
			var exist = _.find(list1, function(j) {
				return i.id == j.id
			})
			if(!exist){
				diff.push(i)
			}
		})
	}
	return diff;
}