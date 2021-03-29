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
	handleKeyEnter: _nodes_keyEnter,
	handleKeyEsc: _nodes_keyEsc,
	handleKeyDelete: _nodes_KeyDelete,
	handleNodeDelete: _nodes_nodeDelete,
	handleNodeMerge: _nodes_nodeMerge,
	getNodeByNid: _nodes_getNodeByNid,
	getTempNode: _nodes_getTempNode,
	getNodeData: _nodes_getNodeData,
	updateScope: _nodes_updateScope
}

function _nodes_init() {
	Nodes.ele = $('#svgpaper');

	//init nodes
    Model.nodes.forEach(function(n) {
    	var node = new Node({nid: n.id});
    	Nodes.items.push(node);
    })
    //init links
    Nodes.items.forEach(function(n) {
    	n.setStatus('stable',false);
    	n.setStatus('stableCount',-10);
    	n.setStatus('linkNexts',VReset);
    	n.setStatus('linkPrevs',VReset);
    })
    setInterval(_nodes_onFrame, 40)
}

function _nodes_nodeNext(type, param){
	var tempNode = _nodes_getTempNode();
	if(type == 'point'){
		tempNode = tempNode || _nodes_generateTempNode(param);
		tempNode.setStatus('onFocus',true,function(node){
			node.setStatus('onEdit',true);
		});
	}
	if(type == 'node'){
		var node = _nodes_getNodeByNid(param);
		if(Nodes.nEdit && !Nodes.nEdit.nid){
			var text = Model.getText(node.nid);
			Entry.updateText(text);
		}else if(Nodes.nEdit && Nodes.nEdit.nid){
			Nodes.nEdit.setStatus('onEdit',false);
			node.setStatus('onFocus',true);
		}else{
			node.setStatus('onFocus',true);
		}
	}
	if(type == 'serial'){
		tempNode = tempNode || _nodes_generateTempNode();
		Nodes.nFocus.linkTo(tempNode);
		_nodes_nodeFocus(tempNode)
	}
	if(type == 'around'){
		if(Nodes.nEdit){
			_nodes_nodeUnEdit(Nodes.nEdit);
		}
		tempNode = tempNode || _nodes_generateTempNode(param);
		tempNode.status = 'around';
		tempNode.moveTo(param, 400, function(node){
			Nodes.nFocus.linkTo(tempNode);
			_nodes_nodeEdit(tempNode)
		});
	}
}

function _nodes_keyEnter(){
	if(!Nodes.nEdit){
		//open temp
		return;
	}
	var text = Entry.pureVal();
	var linkinfo = Nodes.nEdit.getLinkInfo();

	var matched = Model.getNodeByText(text);
	if(matched){
		_nodes_nodeMerge(matched.id, Nodes.nEdit.nid);
		Nodes.nEdit = _nodes_getNodeByNid(matched.id);
	}else if(!Nodes.nEdit.nid){
		var nid = Model.addNode({t:text,next:linkinfo.next,prev:linkinfo.prev});
		Nodes.nEdit.setNid(nid);
		Nodes.nEdit.setText(text);
	}else{
		Model.updateText(Nodes.nEdit.nid, text);
	}

	Entry.hide();
	Nodes.nEdit.displayAs('text');
	Nodes.nEdit.setOpacity(1);
	Nodes.nEdit = null;
}

function _nodes_KeyDelete(){
	if(Nodes.nHover){
		_nodes_nodeDelete(Nodes.nHover.nid);
	}
}

function _nodes_keyEsc(){
	if(Nodes.nEdit){
		Nodes.nEdit.setStatus('onEdit',false);
	}
	else{
		if(Nodes.nFocus){
			Nodes.nFocus.setStatus('onFocus',false);
		}
		var tempNode = _nodes_getTempNode();
		if(tempNode){
			_nodes_nodeDelete(tempNode.nid);
		}
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

function _nodes_getNodeData(nid){
	var node = _nodes_getNodeByNid(nid);
	var linkinfo = Nodes.nEdit.getLinkInfo();
	var text = nid ? Model.getText(nid) : Entry.pureVal();
	return {
		id : nid,
		t:text,
		next:linkinfo.next,
		prev:linkinfo.prev
	}
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