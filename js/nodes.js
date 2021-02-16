var Nodes = {
	nodeIndex: 0,
	path: [],
	items: [],
	ele: null,
	frame: null,
	boardTop: 0,
	init: _nodes_init,
	addNode: _nodes_addNode,
	updateBoardNodes: _nodes_updateBoardNodes,
	releaseNodes: _nodes_releaseNodes,
	getNodeByUid: _nodes_getNodeByUid
	
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
}

function _nodes_onFrame(i) {
	if(i.count % 50 == 0){
		Nodes.items.forEach(function(n){
			if(!n.onBoard){
				if(Math.random() > 0.9){
					n.float();
				}
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
		if(n.onBoard){
			n.release();
			console.log(n.phyObj)
		}
	})
}

function _nodes_updateBoardNodes() {
	if(this.boardTop != Board.ele.css('top')){
		this.boardTop = Board.ele.css('top');
		Nodes.path.forEach(function(n){
			if(n.onBoard){
				var boardEle = Board.ele.find('[uid=' + n.uid + ']');
				if(boardEle){
					n.updateBoardElePos(boardEle);
				}else{
					Nodes.deleteNode(n);
				}
			}
		})
	}
}

function _nodes_getNodeByUid(uid) {
	return _.find(Nodes.path, function(n){
		return n.uid == uid;
	})
}