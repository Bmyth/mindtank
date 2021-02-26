var Model = {
	init : _model_init,
	addNode : _model_add,
	updateText : _model_updateText,
	updateLink : _model_updateLink,
	getText : _model_getText,
	getNodeByText : _model_getNodeByText,
	isLinked: _model_isLinked,
	nodes: []
}

function _model_init() {
	var nodes = localStorage.getItem('nodelist');
	if(nodes){
		nodes = JSON.parse(nodes);
	}
	Model.nodes = nodes || [];
}

function _model_add(text, linkTexts) {
	linkTexts = linkTexts || []
	var matched = _model_getNodeByText(text);
	if(!matched){
		var id = (new Date()).valueOf();
		matched = {
			id : id,
			t: text,
			links: []
		}
		Model.nodes.push(matched);
	}
	linkTexts.forEach(function(t){
		var n = _model_getNodeByText(t);
		if(n){
			_model_updateLink(n.id, matched.id, 1, 'notsave');
		}
	})
	_model_save();
	return matched.id;
}

function _model_updateText(nid, text) {
	var node = _model_getNodeById(nid);
	node.t = text;
	_model_save();
}

function _model_updateLink(nid1, nid2, dnum, notsave) {
	var node1 = _model_getNodeById(nid1);
	var link = _.find(node1.links, function(l){
		return l.id == nid2
	})
	if(!link){
		link = {
			id: nid2,
			n: 0  
		}
		node1.links.push(link);
	}
	link.n += dnum;
	if(link.n == 0){
		node1.links = _.filter(node1.links, function(l){
			return l.id == link.id
		})
	}

	var node2 = _model_getNodeById(nid2);
	link = _.find(node2.links, function(l){
		return l.id == nid1
	})
	if(!link){
		link = {
			id: nid1,
			n: 0  
		}
		node2.links.push(link);
	}
	link.n += dnum;
	if(link.n == 0){
		node2.links = _.filter(node2.links, function(l){
			return l.id == link.id
		})
	}
	if(!notsave){
		_model_save();
	}
}

function _model_getNodeByText(t){
	return _.find(Model.nodes, function(n) {
		return n.t == t;
	})
}

function _model_getNodeById(id){
	return _.find(Model.nodes, function(n) {
		return n.id == id;
	})
}

function _model_getText(id) {
	var node = _model_getNodeById(id);
	return node ? node.t : '';
}

function _model_isLinked(nid1, nid2) {
	var n = _model_getNodeById(nid1);
	if(!n){
		return false;
	}
	var l = _.find(n.links, function(l){
		return l.id == nid2;
	})
	return l ? true : false;
}

function _model_save(){
	localStorage.setItem('nodelist', JSON.stringify(Model.nodes));
}