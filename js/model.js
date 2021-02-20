var Model = {
	init : _model_init,
	addNode : _model_add,
	getText : _model_getText,
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
			$.merge( matched.links, [n.id]);
			$.merge( n.links, [matched.id]);
		}
	})
	localStorage.setItem('nodelist', JSON.stringify(Model.nodes));
	return matched.id;
	
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
	if(n.links.indexOf(nid2) >= 0){
		return true;
	}
	return false;
}