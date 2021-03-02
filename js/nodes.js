var Nodes = {
	nodeIndex: 0,
	items: [],
	ele: null,
	iClock: 0,
	nFocus: null, 
	nEdit: null,
	init: _nodes_init,
	handleNodeNext: _nodes_nodeNext,
	handleNodeEnter: _nodes_nodeEnter,
	getNodeByNid: _nodes_getNodeByNid,
	getTempNode: _nodes_getTempNode
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
	if(type == 'point'){
		var tempNode = _nodes_getTempNode(param);
		_nodes_focusNode(tempNode)
		_nodes_editNode(tempNode)
	}
	if(type == 'node'){
		var node =  _nodes_getNodeByNid(param);
		_nodes_focusNode(node)
		_nodes_editNode(node)
	}
	if(type == 'serial'){
		var tempNode = _nodes_getTempNode(param);
		Nodes.nFocus.linkTo(tempNode);
		_nodes_focusNode(tempNode)
		_nodes_editNode(tempNode)
	}
	if(type == 'around'){
		var tempNode = _nodes_getTempNode(param);
		_nodes_editNode(tempNode)
		Nodes.nFocus.linkTo(tempNode);
		tempNode.moveTo(param);
	}
}

function _nodes_focusNode(node){	
	Nodes.nFocus = node;
	node.setStatus('static');
	node.moveTo(centerPoint)
	Comp.ring.show(centerPoint)

	Nodes.items.forEach(function(n){
		if(n.nid == node.nid){

		}else if(n.isLinked(node.nid)){
			n.setStatus('around', node);
		}else{
			n.setStatus('float');
		}
	})
}

function _nodes_editNode(node){
	Nodes.nEdit = node;
	Entry.ele.val(Model.getText(node.nid)).focus();
	node.displayAs('text');
}

function _nodes_nodeEnter(text){
	var text = Entry.ele.val().replace(/^\s+|\s+$/g,'');
	if(Nodes.nEdit && Nodes.nEdit.nid){
		var n = Model.getNodeByText(text);
		if(n && n.id != Nodes.nEdit.nid){
			//merge
		}else{
			Model.updateText(Nodes.nEdit.nid, text);
			Nodes.nEdit.setText(text);
		} 
	}else if(Nodes.nEdit && !Nodes.nEdit.nid){
		var linkInfo = Nodes.nEdit.getLinkInfo();
		var nid = Model.addNode(text,linkInfo);
		Nodes.nEdit.nid = nid;
	}
}

function _nodes_releaseNodes() {
	
}


function _nodes_getNodeByUid(uid) {
	return _.find(Nodes.items, function(n){
		return n.uid == uid;
	})
}

function _nodes_getNodeByNid(nid) {
	return _.find(Nodes.items, function(n){
		return n.nid == nid;
	})
}

function _nodes_getLinkByNid(fromNid, toNid) {
	return _.find(Nodes.links, function(l){
		return l.fromNid == fromNid && l.toNid == toNid;
	})
}

function _nodes_getTempNode(params){
	params = params || {}
	var temp =  _.find(Nodes.items, function(n){
		return n.nid == null;
	})
	if(!temp){
		temp = new Node({
			x: params.x || 0,
			y: params.y || 0,
			status: 'static',
			displayAs: 'text'
		})
		Nodes.items.push(temp);
	}
	return temp;
}

function _nodes_onFrame() {
	Nodes.updatingUids = [];
	Nodes.items.forEach(function(n){
		n.onFrame(Nodes.iClock);
	})
	// Nodes.updatingUids = _.uniq(Nodes.updatingUids);
	// Nodes.links.forEach(function(l) {
	// 	var f = _.find(Nodes.updatingUids, function(n) {
	// 		return n == l.fromUid || n == l.toUid;
	// 	})
	// 	if(f){
	// 		var fromNode = _nodes_getNodeByUid(l.fromUid);
	// 		var toNode = _nodes_getNodeByUid(l.toUid);
	// 		console.log(fromNode.prevPos,toNode.prevPos)
	// 		l.plot(fromNode.prevPos.x, fromNode.prevPos.y, toNode.prevPos.x, toNode.prevPos.y);
	// 	}
	// })
	Nodes.iClock++;
	if(Nodes.iClock == 2500){
		Nodes.iClock = 0;
	}
}