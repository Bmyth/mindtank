//--------------------------------------action----------------------------------------------
function _nf_action_matching(node){
	if(node.nid == this.nid){
		return;
	}
	var _this = this;
	var nodeText = node.getStatus('text'); 
	var text = this.getStatus('text');
	var equal = nodeText == text;
	var matched = equal || (nodeText.length < 2 ? false : (text.indexOf(nodeText) >= 0));
	var pos = node.getStatus('position');
	if(matched && !equal){
		this.moveToArc({relatePoint: pos, radius:Comp.ring.outerRadius, radiusOffRange:[50, 100], degreeOffRange:[-10, 10], callback: matchCallback})
	}
	else if(equal){
		this.moveTo({pos: pos, callback:equalCallback})
	}
	else if(node.getStatus('onFocus') && this.isLinked(node.nid)){
		var d = Comp.ring.outerRadius - Comp.ring.innerRadius;
		this.moveToArc({relatePoint: pos, radius:Comp.ring.outerRadius, radiusOffRange:[-d, -20], degreeOffRange:[-60, 60], callback: linkCallback})
	}
	else if(!matched){
		if(Comp.ring.inOuterRange(this.getStatus('position'))){
			this.moveToArc({center:pos, relatePoint:this.getStatus('position'), radius: Comp.ring.outerRadius, radiusOffRange:[50, 150], degreeOffRange:[-10, 10], callback: notmatchCallback})
		}else{
			notmatchCallback(this);
		}
	}

	function equalCallback(node){
		node.setStatus('opacity',0);
		node.setStatus('movement','static');
	}

	function linkCallback(node){
		node.setStatus('displayType','text');
		node.setStatus('movement','static');
	}

	function matchCallback(node){
		node.setStatus('displayType','text');
		node.setStatus('movement','float');
	}

	function notmatchCallback(node){
		node.setStatus('displayType',VReset);
		node.setStatus('movement','float');
	}
}

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
		node.setStatus('movement',VReset);
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
function _nf_statusreset_displaytype(node){
	if(node.getStatus('onFocus')){
		return 'text';
	}
	else if(Nodes.nFocus && node.isLinked(Nodes.nFocus.nid)){
		return 'text';
	}else{
		return 'dot';
	}
}

function _nf_statusreset_linknexts(node){
	var n = Model.getNodeById(node.nid);
	return n.next;
}

function _nf_statusreset_linkprevs(node){
	var n = Model.getNodeById(node.nid);
	return n.prev;
}

function _nf_statusreset_movement(node){
	if(Nodes.nFocus && Nodes.nFocus.nid == node.nid){
		return 'static';
	}
	return 'float';
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
		ele = draw.plain(node.getStatus('text')).fill(Style.nodeTextColor).font({size:Style.nodeTextSize,anchor:'middle'});
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
}

function _nf_statusupdate_linkprevs(node, prevValue,value) {

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
		Nodes.nHover = this;
		if(node.getStatus('displayType') == 'dot'){
			node.setStatus('displayType','text');
		}
	}else{
		node.setStatus('displayType',VReset);
		// node.setStatus('movement',VReset);
		Nodes.nHover = null;
	}
}

function _nf_statusupdate_onedit(node, prevValue,value){
	if(value){
		if(Nodes.nEdit  && Nodes.nEdit.nid != node.nid){
			Nodes.nEdit.setStatus('onEdit',false);
		}
		Nodes.nEdit = node;
		Nodes.nEdit.setStatus('opacity',0);
		Entry.show();
	}else{
		Nodes.nEdit = null;
		node.setStatus('displayType',VReset);
		node.setStatus('opacity',1);
		Entry.hide();
	}
}

function _nf_statusupdate_onfocus(node, prevValue,value,callback){
	if(value){
		if(Nodes.nFocus  && Nodes.nFocus.nid != node.nid){
			Nodes.nFocus.setStatus('onFocus',false);
		}
		Nodes.nFocus = node;
		node.moveTo({pos:centerPoint, callback: moveCallback})
	}

	function moveCallback(node){
		Comp.ring.show(centerPoint);
		Nodes.items.forEach(function(n){
			n.matching(node);
		})
		callback && callback(node);
	}
}

function _nf_statusupdate_opacity(node, prevValue,value){
	node.ele && node.ele.opacity(value);
}

function _nf_statusupdate_position(node, prevValue,value) {
	var posDiff = Math.abs(prevValue.x - value.x) + Math.abs(prevValue.y - value.y);
	//show node after pos stable
	var stableCount = node.getStatus('stableCount')
	if(!node.getStatus('stable') && stableCount < 0){
		if(posDiff < 0.1){
			stableCount += 1;
			if(stableCount == 0){
				node.setStatus('stable',true);
			}
		}else{
			stableCount = -5;
		}
		node.setStatus('stableCount',stableCount);
		// return;
	}
	node.ele && node.ele.center(value.x, value.y)
	//sync pos
	if(posDiff > 0){
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

function _nf_statusupdate_stable(node, prevValue,value) {
	if(value){
		node.setStatus('displayType','dot');
		node.setStatus('movement','float');
	}
}

function _nf_statusupdate_text(node, prevValue,value) {
	if(node.getStatus('displayType') == 'text'){
		node.ele.plain(value)
	}
	if(node.getStatus('onEdit')){
		Nodes.items.forEach(function(n){
			if(n.nid != node.nid){
				n.matching(node);
			}
		})
	}
}

//--------------------------------------link----------------------------------------------
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
function _nf_physic_initbody(params){
	this.phyObj = Physic.addCircle({
		x: params.x,
		y: params.y,
		r: Style.nodeShapeRadius,
		isStatic: false,
		frictionAir: 0.5,
		mass: 20
	});
}

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