var Nodes = {
	nodeIndex: 0,
	items: [],
	links: [],
	updatingUids: [],
	ele: null,
	frame: null,
	iClock: 0,
	init: _nodes_init,
	addNode: _nodes_addNode,
	clickNode: _nodes_clickNode,
	focusNode: _nodes_focusNode,
	releaseNodes: _nodes_releaseNodes,
	getLinkByNid: _nodes_getLinkByNid,
	getNodeByUid: _nodes_getNodeByUid,
	getNodeByNid: _nodes_getNodeByNid
	
}

function _nodes_init() {
	Nodes.ele = $('#svgpaper');
	Nodes.map = $('#map');

    Model.nodes.forEach(function(n) {
    	var node = new Node({
    		nid: n.id
    	});
    	Nodes.items.push(node);
    })

    Model.nodes.forEach(function(n) {
    	var node = _nodes_getNodeByNid(n.id);
    	n.links.forEach(function(l) {
    		var lnode = _nodes_getNodeByNid(l);
    		var link = _nodes_getLinkByNid(n.id, l)
    		if(!link){
    			link = draw.line(node.posX, node.posY, lnode.posX, lnode.posY).stroke({ width: 0.1,color: '#aaa'});
				link.fromNid = n.id;
				link.fromUid = node.uid;
				link.toNid = l;
				link.toUid = lnode.uid;
				Nodes.links.push(link);
    		}
    	})
    })

    setInterval(_nodes_onFrame, 40)
}

function _nodes_onFrame() {
	Nodes.updatingUids = [];
	Nodes.items.forEach(function(n){
		if(Nodes.iClock % 200 == 0 && Math.random() > 0.9){
			n.float();
		}
		n.onFrame();
	})
	Nodes.updatingUids = _.uniq(Nodes.updatingUids);
	Nodes.links.forEach(function(l) {
		var f = _.find(Nodes.updatingUids, function(n) {
			return n == l.fromUid || n == l.toUid;
		})
		if(f){
			var fromNode = _nodes_getNodeByUid(l.fromUid);
			var toNode = _nodes_getNodeByUid(l.toUid);
			l.plot(fromNode.posX, fromNode.posY, toNode.posX, toNode.posY);
		}
	})
	Nodes.iClock++;
}

function _nodes_addNode(text) {
	var node = _nodes_getNodeByNid()
	var nid = Model.addNode(text);
	var node = _nodes_getNodeByNid(nid);
	if(!node){
		node = new Node({
			nid: nid
		});
	}
	node.setStatus('text');
	Nodes.items.push(node);
	Nodes.focusNode(node.uid);
}

function _nodes_clickNode(uid) {
	_nodes_focusNode(uid);
	Board.editNode(uid);
	var node = _nodes_getNodeByUid(uid);
	node.move({x:windowWidth * 0.5, y:windowHeight * 0.5})
	node.setStatic(true)
	node.setStatus('hide');
	node.registerPosChange();

	Nodes.items.forEach(function(n){
		if(Model.isLinked(node.nid, n.nid)){
			n.setStatus('text');
		}else{
			n.setStatus('dot');
		}
	})
}

function _nodes_focusNode(uid) {
	var node = _nodes_getFocusNode();
	if(node.uid != uid){
		node.unfocus();
	}
	node = _nodes_getNodeByUid(uid);
	node.focus();
}

function _nodes_releaseNodes() {
	Nodes.path.forEach(function(n){
		if(n.onPath && n.phyObj.isStatic){
			var ele = Board.getNodeEle(n.uid);
			if(!ele){
				n.release();
			}
		}
	})
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

function _nodes_getFocusNode() {
	return _.find(Nodes.items, function(n){
		return n.focus;
	})
}