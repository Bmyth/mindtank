var Nodes = {
	nodeIndex: 0,
	path: [],
	items: [],
	links: [],
	updatingUids: [],
	ele: null,
	frame: null,
	boardTop: 0,
	iClock: 0,
	init: _nodes_init,
	addNode: _nodes_addNode,
	updateBoardNodes: _nodes_updateBoardNodes,
	releaseNodes: _nodes_releaseNodes,
	getLinkByNid: _nodes_getLinkByNid,
	getNodeByUid: _nodes_getNodeByUid,
	getNodeByNid: _nodes_getNodeByNid
	
}

function _nodes_init() {
	Nodes.ele = $('#svgpaper');

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

function _nodes_addNode(ele, prevText) {
	var text = ele.text();
	var id = Model.addNode(text, prevText);
	ele.attr('nid', id);
	var node = new Node({
		textele: ele, 
		nid: ele.attr('nid'),
		prevuid: ele.attr('prevuid')
	});
	ele.attr('uid',node.uid).addClass('nodeholder');
	Nodes.path.push(node);
	Nodes.items.push(node);
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

function _nodes_updateBoardNodes() {
	if(this.boardTop != Board.ele.css('top')){
		this.boardTop = Board.ele.css('top');
		Nodes.path.forEach(function(n){
			if(n.onPath){
				n.updateBoardElePos();
			}
		})
	}
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