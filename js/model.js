var Model = {
	init : _model_init,
	addNode : _model_add,
	getNodeByText : _model_getNodeByText,
	getNodeById : _model_getNodeById,
	getText : _model_getText,
	addLink : _model_addLink,
	updateNode : _model_updateNode,
	deleteNode : _model_deleteNode,
	mergeNode : _model_mergeNode,
	save : _model_save,
	canSave : true,
	nodes: []
}

function _model_init() {
	var nodes = localStorage.getItem('nodelist');
	if(nodes){
		nodes = JSON.parse(nodes);
	}
	Model.nodes = nodes || [];
}

function _model_add(params) {
	var matched = _model_getNodeByText(params.t);
	if(!matched){
		var id = (new Date()).valueOf();
		matched = {
			id : id,
			t: params.t,
			next: [],
			prev: []
		}
		Model.nodes.push(matched);
	}
	_model_updateNode(matched, params);
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

function _model_addLink(nid1, nid2, dnum) {
	var node1 = _model_getNodeById(nid1);
	var link = _.find(node1.links, function(l){
		return l.id == nid2
	})
	if(!link){
		link = {
			id: nid2,
			w: 0  
		}
		node1.links.push(link);
	}
	link.w += dnum;
	if(link.w == 0){
		node1.links = _.filter(node1.links, function(l){
			return l.id != link.id
		})
	}

	var node2 = _model_getNodeById(nid2);
	link = _.find(node2.links, function(l){
		return l.id == nid1
	})
	if(!link){
		link = {
			id: nid1,
			w: 0  
		}
		node2.links.push(link);
	}
	link.w += dnum;
	if(link.w == 0){
		node2.links = _.filter(node2.links, function(l){
			return l.id != link.id
		})
	}
	_model_save();
}

function _model_updateNode(iNode, params){
	var node = typeof iNode == 'object' ? iNode : _model_getNodeById(iNode);
	if(params.t){
		node.t = params.t;
	}
	if(params.next){
		node.next = params.next;
	}
	if(params.prev){
		node.prev = params.prev;
	}

	if(params.next || params.prev){
		_model_syncLinks(node);
	}
	_model_save();
}

function _model_deleteNode(id){
	Model.nodes = _.filter(Model.nodes, function(n){
		return n.id != id;
	})
	Model.nodes.forEach(function(n){
		n.next = _.filter(n.next, function(l){
			return l.id != id;
		})
		n.prev = _.filter(n.prev, function(l){
			return l.id != id;
		})
	})
	_model_save();
}

function _model_mergeNode(id1, id2){
	var node1 = _model_getNodeById(id1) || Nodes.getNodeData(id1);
	var node2 = _model_getNodeById(id2) || Nodes.getNodeData(id1);
	node2.next.forEach(function(ne){
		var n = _model_getNodeById(ne.id);
		var p1 = _.find(n.prev, function(pr){
			return pr.id == id1;
		})
		var p2 = _.find(n.prev, function(pr){
			return pr.id == id2;
		})
		var p = {
			id : id1,
			w : 0
		}
		if(p1){
			p.w += p1.w
		}
		if(p2){
			p.w += p2.w
		}
		n.prev = _.filter(n.prev, function(pr){
			return pr.id != id1 && pr.id != id2;
		})
		n.prev.push(p)

		var ne1 = _.find(node1.next, function(ne){
			return ne.id == n.id;
		})
		if(!ne1){
			ne1 = {
				id : n.id,
				w : p.w
			}
			node1.next.push(ne1);
		}else{
			ne1.w = p.w
		}
	})

	node2.prev.forEach(function(pr){
		var n = _model_getNodeById(pr.id);
		var p1 = _.find(n.next, function(ne){
			return pr.id == id1;
		})
		var p2 = _.find(n.next, function(ne){
			return pr.id == id2;
		})
		var p = {
			id : id1,
			w : 0
		}
		if(p1){
			p.w += p1.w
		}
		if(p2){
			p.w += p2.w
		}
		n.next = _.filter(n.next, function(ne){
			return pr.id != id1 && pr.id != id2;
		})
		n.next.push(p)

		var pr1 = _.find(node1.prev, function(pr){
			return pr.id == n.id;
		})
		if(!pr1){
			pr1 = {
				id : n.id,
				w : p.w
			}
			node1.prev.push(pr1);
		}else{
			pr1.w = p.w
		}
	})
	Model.nodes = _.filter(Model.nodes, function(n){
		return n.id != id2
	})
	_model_save();
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
	if(Model.canSave){
		localStorage.setItem('nodelist', JSON.stringify(Model.nodes));
	}		
}