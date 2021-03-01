var Model = {
	init : _model_init,
	addNode : _model_add,
	updateText : _model_updateText,
	updateLink : _model_updateLink,
	getText : _model_getText,
	getNodeByText : _model_getNodeByText,
	nodes: []
}

function _model_init() {
	var nodes = localStorage.getItem('nodelist');
	if(nodes){
		nodes = JSON.parse(nodes);
	}
	Model.nodes = nodes || [];
}

function _model_add(text, linkInfo) {
	var matched = _model_getNodeByText(text);
	if(!matched){
		var id = (new Date()).valueOf();
		matched = {
			id : id,
			t: text,
			next: linkInfo.next,
			prev: linkInfo.prev
		}
		Model.nodes.push(matched);
	}
	_model_syncLinks(matched);
	_model_save();
	return matched.id;
}

function _model_syncLinks(node){
	node.next.forEach(function(t){
		var n = _model_getNodeById(t.id);
		if(n){
			var l = n.prev.find(function(p){
				return p.id == node.id
			})
			if(!l){
				l = {
					id : node.id,
					w : 0
				}
				n.prev.push(l);
			}
			l.w = t.w || 1;
		}
	})

	node.prev.forEach(function(t){
		var n = _model_getNodeById(t.id);
		if(n){
			var l = n.next.find(function(p){
				return p.id == node.id
			})
			if(!l){
				l = {
					id : node.id,
					w : 0
				}
				n.next.push(l);
			}
			l.w = t.w || 1;
		}
	})
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

function _model_save(){
	localStorage.setItem('nodelist', JSON.stringify(Model.nodes));
}