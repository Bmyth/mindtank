var Nodes = {
	nodeIndex: 0,
	path: [],
	items: [],
	links: [],
	ele: null,
	frame: null,
	boardTop: 0,
	init: _nodes_init,
	addNode: _nodes_addNode,
	updateBoardNodes: _nodes_updateBoardNodes,
	updateRelatedLinks: _nodes_updateRelatedLinks,
	releaseNodes: _nodes_releaseNodes,
	getLinkByNid: _nodes_getLinkByNid,
	getNodeByUid: _nodes_getNodeByUid,
	getNodeByNid: _nodes_getNodeByNid
	
}

function _nodes_init() {
	Nodes.ele = $('#nodecontainer').css({
        width: windowWidth + 'px',
        height: windowHeight + 'px'
    });
    Nodes.frame = new Group();
    Nodes.frame.onFrame = _nodes_onFrame;

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
    			link = new Path.Line({
				    from: [node.posX, node.posY],
				    to: [lnode.posX, lnode.posY],
				    strokeColor: '#aaa',
				    strokeWidth: 0.1,
				    opacity: 0.5
				});
				// link.dashArray = [5, 5];
				link.fromNid = n.id;
				link.fromUid = node.uid;
				link.toNid = l;
				link.toUid = lnode.uid;
				Nodes.links.push(link);
    		}
    	})
    })
}

function _nodes_onFrame(i) {
	if(i.count % 500 == 0){
		Nodes.items.forEach(function(n){
			if(Math.random() > 0.9){
				n.float();
			}
		})
	}
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

function _nodes_updateRelatedLinks(nid) {
	Nodes.links.forEach(function(l) {
		if(l.fromNid == nid || l.toNid == nid){
			var fromNode = _nodes_getNodeByUid(l.fromUid);
			var toNode = _nodes_getNodeByUid(l.toUid);
			l.segments[0].point.x = fromNode.posX;
			l.segments[0].point.y = fromNode.posY;
			l.segments[1].point.x = toNode.posX;
			l.segments[1].point.y = toNode.posY;
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