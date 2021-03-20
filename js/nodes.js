var Nodes = {
	nodeIndex: 0,
	items: [],
	ele: null,
	iClock: 0,
	nFocus: null, 
	nEdit: null,
	nHover: null,
	init: _nodes_init,
	handleNodeNext: _nodes_nodeNext,
	handleNodeTextUpdate: _nodes_nodeTextUpdate,
	handleKeyEnter: _nodes_keyEnter,
	handleKeyEsc: _nodes_keyEsc,
	handleKeyDelete: _nodes_KeyDelete,
	handleNodeDelete: _nodes_nodeDelete,
	handleNodeMerge: _nodes_nodeMerge,
	getNodeByNid: _nodes_getNodeByNid,
	getTempNode: _nodes_getTempNode,
	updateScope: _nodes_updateScope
}

function _nodes_init() {
	Nodes.ele = $('#svgpaper');

    Model.nodes.forEach(function(n) {
    	var node = new Node({
    		nid: n.id,
    		prev: n.prev,
    		next: n.next
    	});
    	Nodes.items.push(node);
    })

    Nodes.items.forEach(function(n){
    	n.initLinks();
    })

    setInterval(_nodes_onFrame, 40)
}

function _nodes_nodeNext(type, param){
	// Entry.hide();
	// if(Nodes.nEdit){
 //        Nodes.nEdit.setOpacity(1);
 //        Nodes.nEdit = null;
 //    }
	var tempNode = _nodes_getTempNode();
	if(type == 'point'){
		tempNode = tempNode || _nodes_generateTempNode(param);
		_nodes_nodeFocus(tempNode, _nodes_nodeEdit)
	}
	if(type == 'node'){
		var node = _nodes_getNodeByNid(param);
		if(Nodes.nEdit){
			var text = Model.getText(node.nid);
			Entry.ele.val(text).focus();
			_nodes_nodeTextUpdate();
		}else{
			_nodes_nodeFocus(node)
		}
	}
	if(type == 'serial'){
		tempNode = tempNode || _nodes_generateTempNode();
		Nodes.nFocus.linkTo(tempNode);
		_nodes_nodeFocus(tempNode, _nodes_nodeEdit)
	}
	if(type == 'around'){
		tempNode = tempNode || _nodes_generateTempNode(param);
		tempNode.status = 'around';
		tempNode.moveTo(param, 400, function(node){
			Nodes.nFocus.linkTo(tempNode);
			_nodes_nodeEdit(tempNode)
		});
	}
}

function _nodes_nodeFocus(node, callback){	
	Nodes.nFocus = node;
	node.setStatus('static');
	node.moveTo(centerPoint, 400, function(node){
		Comp.ring.show(centerPoint);
		Nodes.items.forEach(function(n){
			if(n.nid == node.nid){

			}else if(n.isLinked(node.nid)){
				n.setStatus('around', node);
			}else{
				n.setStatus('float');
			}
		})
		callback && callback(node)
	})
}

function _nodes_nodeEdit(node){
	Nodes.nEdit = node;
	Nodes.nEdit.setOpacity(0);
	Entry.show();
}

function _nodes_nodeTextUpdate(){
	var text = Entry.ele.val();
	if(Nodes.nEdit){
		var node = Nodes.nEdit;
		Nodes.nEdit.setText(text);
		var matched = null;
		Nodes.items.forEach(function(n){
			if(n.nid == node.nid){

			}else if(n.isLinked(node.nid)){
				
			}else{
				matched = n.matchText(Nodes.nEdit);
			}
		})
	}	
}

function _nodes_keyEnter(){
	if(!Nodes.nEdit){
		//open temp
		return;
	}
	Model.canSave = false;
	var text = Entry.ele.val().replace(/^\s+|\s+$/g,'');
	var linkinfo = Nodes.nEdit.getLinkInfo();

	if(!Nodes.nEdit.nid){
		var nid = Model.addNode({t:text,next:linkinfo.next,prev:linkinfo.prev});
		Nodes.nEdit.setNid(nid);
	}else{
		Model.updateText(Nodes.nEdit.nid, text);
	}

	var matched = Model.getNodeByText(text);
	if(matched && matched.id != Nodes.nEdit.nid){
		_nodes_nodeMerge(matched.id, Nodes.nEdit.nid);
	}
	Model.canSave = true;
	Model.save();

	Entry.hide();
	Nodes.nEdit.displayAs('text');
	Nodes.nEdit.setText(text);
	Nodes.nEdit.setOpacity(1);
	Nodes.nEdit = null;
}

function _nodes_KeyDelete(){
	if(Nodes.nHover){
		_nodes_nodeDelete(Nodes.nHover.nid);
	}
}

function _nodes_keyEsc(){
	if(Nodes.nFocus){
		Nodes.items.forEach(function(n){
			n.setStatus('float');
		})
		Nodes.nFocus = null;
		Comp.ring.hide();
	}
	if(Nodes.nEdit){
		Nodes.nEdit = null;
		Entry.hide();
	}
	var tempNode = _nodes_getTempNode();
	if(tempNode){
		_nodes_nodeDelete(tempNode.nid);
	}
}

function _nodes_nodeDelete(nid) {
	if(nid){
		Model.deleteNode(nid);
	}
	var node = _nodes_getNodeByNid(nid);
	if(Nodes.nEdit && Nodes.nEdit.nid == nid){
		Nodes.nEdit == null;
		Entry.ele.val('');
	}
	if(Nodes.nFocus && Nodes.nFocus.nid == nid){
		Nodes.nFocus == null;
	}
	if(Nodes.nHover && Nodes.nHover.nid == nid){
		Nodes.nHover == null;
	}
	node.remove(function(){
		Nodes.items = _.filter(Nodes.items, function(n){
			return n.nid != nid;
		})
	});
}

function _nodes_nodeMerge(nid1, nid2){
	//model merge
	Model.mergeNode(nid1,nid2); 
	//node merge
	var n = Model.getNodeById(nid1);
	var node = _nodes_getNodeByNid(nid1);
	node.initLinks();
	n.prev.forEach(function(pr){
		var prevNode = _nodes_getNodeByNid(pr.id);
		prevNode.initLinks();
 	})
 	_nodes_nodeDelete(nid2);
}

function _nodes_updateScope(pos) {
	if(pos){
		Comp.scope.moveTo(pos);
	}
	Nodes.items.forEach(function(n){
		n.updateDisplayByScope();
	})
}

function _nodes_getNodeByNid(nid) {
	return _.find(Nodes.items, function(n){
		return n.nid == nid;
	})
}

function _nodes_getTempNode(){
	return  _.find(Nodes.items, function(n){
		return n.nid == null;
	})
}

function _nodes_generateTempNode(pos){
	pos = pos || {}
	var temp = new Node({
		x: pos.x || 0,
		y: pos.y || 0,
		status: 'static',
		displayAs: 'text'
	})
	Nodes.items.push(temp);
	return temp;
}

function _nodes_onFrame() {
	Nodes.updatingUids = [];
	Nodes.items.forEach(function(n){
		n.onFrame(Nodes.iClock);
	})
	Comp.scope.onFrame(Nodes.iClock);
	Nodes.iClock++;
	if(Nodes.iClock == 2500){
		Nodes.iClock = 0;
	}
}