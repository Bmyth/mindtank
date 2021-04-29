var minNodeDistance = 100;

function Node(params){
	params.x = params.x || windowWidth * Math.random();
	params.y = params.y || windowHeight * Math.random();

	this.nid = params.nid || '';
	this.shape = null;
	this.ele = null;
	this.phyObj = null;
	this.links = [];
	this.status = {};

	this.onFrame = _node_onFrame;
	this.setNid = _node_setNid;
	this.remove = _node_remove;
	this.save = _node_save;
	this.addStatus = _node_addStatus;
	this.getStatus = _node_getStatus;
	this.setStatus = _node_setStatus;
	this.getModel = _node_getModel;
	this.getDistanceTo = _node_getDistanceTo;
	this.resetStatus = _node_resetStatus;
	this.merge = _node_merge;

	this.refreshLink = _nf_link_refresh;
	this.isLinked = _nf_link_islinked;
	this.addLink = _nf_link_add;
	this.removeLink = _nf_link_remove;
	this.moveTo = _nf_action_moveto;
	this.moveToArc = _nf_action_movetoarc;
	

	_nf_init_shape_and_phyobj.call(this, params);

	this.addStatus('position',{value:{x:params.x,y:params.y},updateHandler:_nf_statusupdate_position});
	this.addStatus('text',{value:VReset, updateHandler:_nf_statusupdate_text, resetHandler:_nf_statusreset_text});
	this.addStatus('movement',{value:'float', updateHandler:_nf_statusupdate_movement});
	this.addStatus('linkNexts',{value:[], updateHandler:_nf_statusupdate_linknexts, resetHandler:_nf_statusreset_linknexts});
	this.addStatus('linkPrevs',{value:[], updateHandler:_nf_statusupdate_linkprevs, resetHandler:_nf_statusreset_linkprevs});
	this.addStatus('displayType',{value:'dot', updateHandler:_nf_statusupdate_displaytype, runUpdate:true});
	this.addStatus('onHover',{value:false, updateHandler:_nf_statusupdate_onhover});
	this.addStatus('onFocus',{value:false, updateHandler:_nf_statusupdate_onfocus});
	this.addStatus('onEdit',{value:false, updateHandler:_nf_statusupdate_onedit});
	this.addStatus('opacity',{value:1, updateHandler:_nf_statusupdate_opacity});
}

function _node_addStatus(name, params){
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

function _node_getStatus(name){
	return this.status[name].value;
}


function _node_setStatus(name, value, callback){
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

function _node_resetStatus(status){
	if(this.getStatus('movement') == 'animate'){
		return;
	}
	var _this = this;
	var sOpacity = 1, sDisplayType = 'dot', sMovement = 'float', sPosition = null;
	if(Nodes.nEdit && Nodes.nEdit.nid != this.nid){
		var editText = Nodes.nEdit.getStatus('text');
		var text = this.getStatus('text');
		var isEqual = editText == text;
		var isMatched = !isEqual && (editText.length < 2 ? false : (text.indexOf(editText) >= 0));
		if(isEqual){
			sPosition = Nodes.nEdit.getStatus('position');
			sOpacity = 0;
		}else if(isMatched){
			sDisplayType = 'text';
			sMovement = 'static';
		}
	}
	if(Nodes.nEdit && Nodes.nEdit.nid == this.nid){
		sOpacity = 0;
	}
	if(Nodes.nFocus && Nodes.nFocus.nid != this.nid){
		var isLinked = this.isLinked(Nodes.nFocus.nid);
		if(isLinked){
			sDisplayType = 'text';
			sMovement = 'static';
		}
	}
	if(Nodes.nFocus && Nodes.nFocus.nid == this.nid){
		sDisplayType = 'text';
		sMovement = 'static';
	}

	var setStatus = function (node) {
		console.log(node.getStatus('position'))
		if(!status || status == 'opacity'){
			node.setStatus('opacity',sOpacity);
		}
		if(!status || status == 'displayType'){
			node.setStatus('displayType',sDisplayType);
		}
		if(!status || status == 'movement'){
			node.setStatus('movement',sMovement);
		}
	}

	if((!status || status == 'position') && sPosition){
		console.log(this.nid)
		console.log(sPosition.x,sPosition.y)
		this.moveTo({pos:sPosition, callback:setStatus})
	}else{
		setStatus(this)
	}
}

function _node_onFrame(i) {
	// if(this.deleting){
	// 	return;
	// }
	var movementStatus = this.getStatus('movement')	
	if(movementStatus == 'float'){
		if(!this.getStatus('onHover') &&  i % 25 == 0 && Math.random() > 0.5){
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
			if(diff > 0.01){
				this.setStatus('position',{x:x,y:y})
			}
		}
	}else if(movementStatus == 'animate'){
		this.setStatus('position',{x:this.shape.cx(),y:this.shape.cy()})
	}else if(movementStatus == 'static'){

	}
}

function _node_merge(nid2){
	//model merge
	var id1 = this.nid, id2 = nid2;
	if(!id1){
		id1 = id2;
		id2 = '';
	}
	Model.mergeNode(id1,id2);

	var node2 = Nodes.getNodeByNid(id2);
 	node2.remove();

 	this.setNid(id1);
	//node merge
	var n = Model.getNodeById(id1);
	this.setStatus('linkNexts',n.next);
    this.setStatus('linkPrevs',n.prev); 	
}


function _node_getModel(){
	var linkNexts = _.filter(this.getStatus('linkNexts'), function(l){
		return l.id != null;
	})
	var linkPrevs = _.filter(this.getStatus('linkPrevs'), function(l){
		return l.id != null;
	})
	return {
		id : this.nid,
		t:this.getStatus('text'),
		next:linkNexts,
		prev:linkPrevs
	}
}

function _node_getDistanceTo(pos) {
	var _pos = this.getStatus('position');
	return Matter.Vector.magnitude({x:_pos.x - pos.x, y:_pos.y - pos.y});
}

function _node_setNid(nid){
	this.nid = nid;
	this.shape.attr('nid', nid);
	this.ele.attr('nid', nid);
}

function _node_save(){
	
}

function _node_remove(callback){
	var node = this;
	if(this.nid){
		Model.deleteNode(this.nid);
	}

	this.links.forEach(function(l){
		l.line.remove();
		if(l.constraint){
			Physic.deleteObject(l.constraint);
		}
	})
	this.links = [];

	Nodes.items.forEach(function(n){
		if(n.isLinked(node.nid) == 'next'){
			n.removeLink(node.nid);
		}
	})
	Physic.deleteObject(this.phyObj);
	node.shape.remove();
	node.ele.remove();

	if(Nodes.nEdit && Nodes.nEdit.nid ==this. nid){
		Nodes.nEdit == null;
		Entry.ele.val('');
	}
	if(Nodes.nFocus && Nodes.nFocus.nid == this.nid){
		Nodes.nFocus == null;
	}
	if(Nodes.nHover && Nodes.nHover.nid == this.nid){
		Nodes.nHover == null;
	}
	if(!this.nid){
		Nodes.nTemp == null;
	}

	Nodes.items = _.filter(Nodes.items, function(n){
		return n.nid != node.nid;
	})
}
