var Nodes = {
	nodeIndex: 0,
	items: [],
	links: [],
	updatingUids: [],
	ele: null,
	frame: null,
	iClock: 0,
	focused: null, 
	tempNode: null,
	init: _nodes_init,
	nextNode: _nodes_nextNode,
	focusNode: _nodes_focusNode,
	enter: _nodes_enter,
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

    Nodes.tempNode = new Node({
		temp: true
	});
	Nodes.items.push(Nodes.tempNode);

    _nodes_updateLinks();

    setInterval(_nodes_onFrame, 40)
}

function _nodes_nextNode(type, pos){
	var tempNode = Nodes.tempNode;
	if(type == 'serial'){

	}
	if(type == 'parallel'){
		tempNode.setPos(pos);
		tempNode.displayAs('text');
		tempNode.setText('_');
		tempNode.setStatus('static');
		Entry.ele.val('').focus();
	}
}

function _nodes_focusNode(uid){
	var node = _nodes_getNodeByUid(uid);
	Entry.ele.val(Model.getText(node.nid)).focus();
	var prevNode = Nodes.focused;
	if(prevNode){
		prevNode.unfocus();
	}
	Nodes.focused = node;
	node.displayAs('text');
	node.moveTo(centerPoint)
	Comp.ring.show(centerPoint)

	if(prevNode){
		node.linkTo(prevNode);
		if(!node.temp){
			Model.updateLink(node.nid, prevNode.nid, 1);
		}
	}

	Nodes.items.forEach(function(n){
		if(n.uid == uid || n.temp){

		}else if(Model.isLinked(node.nid, n.nid) || node.isLinked(n.uid)){
			n.around(node);
		}else{
			n.float();
		}
	})
}

function _nodes_enter(text){
	var text = Entry.ele.val().replace(/^\s+|\s+$/g,'');
	if(Nodes.focused && !Nodes.focused.temp){
		var n = Model.getNodeByText(text);
		if(n && n.id != Nodes.focused.nid){

		}else{
			Model.updateText(Nodes.focused.nid, text);
			Nodes.focused.updateText(text);
			Nodes.focused.unfocus();
		} 
	}else if(Nodes.focused && Nodes.focused.temp){
		var linkTexts = _.map(Nodes.focused.links, function(l){
			return Model.getText(l.node.nid)
		})
		var nid = Model.addNode(text,linkTexts);
		var n = _nodes_getNodeByNid(nid);
		if(!n){
			n = new Node({
				nid: nid
			});
			Nodes.items.push(n);
			_nodes_updateLinks();
		}
		Nodes.focused.unfocus();
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

function _nodes_updateLinks(){
	Model.nodes.forEach(function(n) {
    	var node = _nodes_getNodeByNid(n.id);
    	n.links.forEach(function(l) {
    		var lnode = _nodes_getNodeByNid(l.id);
    		var link = _nodes_getLinkByNid(n.id, l.id)
    		if(!link){
    			link = draw.line(node.posX, node.posY, lnode.posX, lnode.posY).stroke({ width: 0.1,color: '#aaa'});
				link.fromNid = n.id;
				link.fromUid = node.uid;
				link.toNid = l.id;
				link.toUid = lnode.uid;
				Nodes.links.push(link);
    		}
    	})
    })
}

function _nodes_onFrame() {
	Nodes.updatingUids = [];
	Nodes.items.forEach(function(n){
		n.onFrame(Nodes.iClock);
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
	if(Nodes.iClock == 2500){
		Nodes.iClock = 0;
	}
}