var Nodes = {
	items: [],
	iClock: 0,
	nFocus: null, 
	nEdit: null,
	nHover: null,
	nTemp: null,
	init: _nodes_init,
	handleNodeNext: _nodes_nodeNext,
	getNodeByNid: _nodes_getNodeByNid,
	getTempNode: _nodes_getTempNode
}

function _nodes_init() {
	//init nodes
    Model.nodes.forEach(function(n) {
    	var node = new Node({nid: n.id});
    	Nodes.items.push(node);
    })
    //init links
    Nodes.items.forEach(function(n) {
    	n.setStatus('linkNexts',VReset);
    	n.setStatus('linkPrevs',VReset);
    })
    setInterval(_nodes_onFrame, 40)
}

function _nodes_nodeNext(type, param){
	if(type == 'point'){
		Nodes.nTemp = Nodes.getTempNode(param);
		if(Nodes.nEdit){
			Nodes.nEdit.setStatus('onEdit',false);
		}
		if(Nodes.nFocus && Nodes.nFocus.nid){
			Nodes.nFocus.addLink(Nodes.nTemp);
		}
		Nodes.nTemp.setStatus('onFocus',true);
		Nodes.nTemp.setStatus('onEdit',true);
	}
	if(type == 'node'){
		var node = _nodes_getNodeByNid(param);
		node.setStatus('onFocus',true);
		node.setStatus('onEdit',true);
	}
}

function _nodes_getNodeByNid(nid) {
	return _.find(Nodes.items, function(n){
		return n.nid == nid;
	})
}

function _nodes_getTempNode(pos){
	if(Nodes.nTemp && !Nodes.nTemp.nid){
		return Nodes.nTemp;
	}
	pos = pos || {}
	var temp = new Node({
		x: pos.x || 0,
		y: pos.y || 0,
		status: 'static',
		displayAs: 'text'
	})
	Nodes.items.push(temp);
	Nodes.nTemp = temp;
	return Nodes.nTemp;
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