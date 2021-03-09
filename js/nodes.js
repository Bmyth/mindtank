var Nodes = {
	nodeIndex: 0,
	items: [],
	ele: null,
	iClock: 0,
	nFocus: null, 
	nEdit: null,
	init: _nodes_init,
	handleNodeNext: _nodes_nodeNext,
	handleNodeTextUpdate: _nodes_nodeTextUpdate,
	handleNodeEnter: _nodes_nodeEnter,
	handleEsc: _nodes_handleEsc,
	handleNodeDelete: _nodes_nodeDelete,
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
	Entry.hide();
	if(Nodes.nEdit){
        Nodes.nEdit.setOpacity(1);
        Nodes.nEdit = null;
    }
	var tempNode = _nodes_getTempNode();
	if(type == 'point'){
		tempNode = tempNode || _nodes_generateTempNode(param);
		_nodes_nodeFocus(tempNode, _nodes_nodeEdit)
	}
	if(type == 'node'){
		if(tempNode){
			_nodes_nodeDelete(tempNode.nid);
		}
		var node = _nodes_getNodeByNid(param);
		_nodes_nodeFocus(node, _nodes_nodeEdit)
	}
	if(type == 'serial'){
		tempNode = tempNode || _nodes_generateTempNode();
		Nodes.nFocus.linkTo(tempNode);
		_nodes_nodeFocus(tempNode, _nodes_nodeEdit)
	}
	if(type == 'around'){
		tempNode = tempNode || _nodes_generateTempNode(param);
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

function _nodes_nodeTextUpdate(text){
	if(Nodes.nEdit){
		var node = Nodes.nEdit;
		Nodes.nEdit.setText(text);
		Nodes.items.forEach(function(n){
			if(n.nid == node.nid){

			}else if(n.isLinked(node.nid)){
				
			}else{
				// n.updateDistanceByText(node);
			}
		})
	}	
}

function _nodes_nodeEnter(){
	var text = Entry.ele.val().replace(/^\s+|\s+$/g,'');
	if(Nodes.nEdit){
		Nodes.nEdit.displayAs('text');
		Nodes.nEdit.setText(text);
		Nodes.nEdit.setOpacity(1);
		Entry.hide();
	}
	
	if(Nodes.nEdit && Nodes.nEdit.nid){
		var n = Model.getNodeByText(text);
		if(n && n.id != Nodes.nEdit.nid){
			//merge
		}else{
			Model.updateText(Nodes.nEdit.nid, text);
		} 
	}else if(Nodes.nEdit && !Nodes.nEdit.nid){
		var linkInfo = Nodes.nEdit.getLinkInfo();
		var nid = Model.addNode(text,linkInfo);
		Nodes.nEdit.setNid(nid);
	}
	Nodes.nEdit = null;
}

function _nodes_handleEsc(){
	if(Nodes.nFocus){
		Nodes.items.forEach(function(n){
			n.setStatus('float');
		})
		Nodes.nFocus = null;
		Comp.ring.hide();
	}
	if(Nodes.nEdit){
		Nodes.nEdit = null;
		Entry.hide();;
	}
	var tempNode = _nodes_getTempNode();
	if(tempNode){
		_nodes_nodeDelete(tempNode.nid);
	}
}

function _nodes_nodeDelete(nid) {
	var node = _nodes_getNodeByNid(nid);
	if(nid){
		Model.deleteNode(nid);
	}
	Nodes.items.forEach(function(n){
		n.removeLinkOfNode(nid);
	})
	node.remove();
	Nodes.items = _.filter(Nodes.items, function(n){
		return n.nid != nid;
	})

	if(Nodes.nEdit && Nodes.nEdit.nid == nid){
		Nodes.nEdit == null;
		Entry.ele.val('');
	}
	if(Nodes.nFocus && Nodes.nFocus.nid == nid){
		Nodes.nFocus == null;
		Comp.ring.hide();
	}

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