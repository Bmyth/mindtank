var minNodeDistance = 100;
function Node(params){
	var node = {};
	node.uid = generateUid();
	node.onPath = params.textele ? true : false;
	node.nid = params.nid;
	node.prevUid = params.prevuid;

	//ele & pos
	node.textele = draw.plain(Model.getText(node.nid)).fill('#666').font({size:14}).attr('uid',node.uid);
	node.dotele = draw.circle(5).fill('#aaa').attr('uid',node.uid);

	node.dotele.on('mouseenter',_node_mouseEnterDot);
	node.textele.on('mouseleave',_node_mouseLeaveText);

	if(node.onPath){
		var textEleRect = params.textele[0].getBoundingClientRect();
		node.posX = textEleRect.left + textEleRect.width * 0.5;
		node.posY = textEleRect.top + textEleRect.height * 0.5;
	}else{ 
		node.posX = windowWidth * Math.random();
		node.posY = windowHeight * Math.random();
	}

	//pathlink
	if(node.prevUid){
		node.prevNode = Nodes.getNodeByUid(node.prevUid);
		node.prevX = node.prevNode.posX;
		node.prevY = node.prevNode.posY;
		node.link = draw.line(node.posX, node.posY, node.prevX, node.prevY).stroke({ width: 0.5,color: '#666'});
	}

	//phyobj
	var size = {width:node.textele.width(), height:node.textele.height()};
	var prevObj = node.prevNode ? node.prevNode.phyObj : null;
	var isStatic = node.onPath;
	node.phyObj = Physic.addObj({
		x: node.posX,
		y: node.posY,
		w: Math.max(30,size.width),
		h: Math.max(30,size.height),
		isStatic: isStatic,
		frictionAir: 0.01,
		mass: 20
	},prevObj);

	node.onFrame = _node_onFrame;
	node.release = _node_release;
	node.updateBoardElePos = _node_updateBoardElePos;
	node.syncPos = _node_syncPos;
	node.float = _node_float;
	node.setStatus = _node_setStatus;

	var status = node.onPath ? 'text' : 'dot';
	node.setStatus(status)
	node.syncPos();
	return node;
}

function _node_onFrame(i) {
	var x,y;
	var d = 0;
	if(this.phyObj.isStatic){
		x = parseInt(this.posX);
		y = parseInt(this.posY);
	}else{
		x = this.phyObj.position.x;
		y = this.phyObj.position.y;
	}
	var needSync = false;
	if(this.prevNode && (this.prevX != this.prevNode.posX || this.prevY != this.prevNode.posY)){
		d = d + Math.abs(this.prevNode.posX - this.prevX) + Math.abs(this.prevNode.posY - this.prevY);
		this.prevX = this.prevNode.posX;
		this.prevY = this.prevNode.posY;
		needSync = true;
	}
	if(this.posX != x || this.posY != y){
		d = d + Math.abs(this.posX - x) + Math.abs(this.posY - y);
		this.posX = x;
		this.posY = y;
		needSync = true;
	}
	if(needSync){
		this.syncPos();
	}
	if(d > 0.1){
		Nodes.updatingUids.push(this.uid)
	}
}

function _node_release() {
	Physic.setStatic(this.phyObj, false)
}

function _node_updateBoardElePos(){
	if(this.phyObj.isStatic){
		var boardEle = Board.getNodeEle(this.uid);
		if(boardEle){
			var rect = boardEle[0].getBoundingClientRect();
			this.posX = rect.left + rect.width * 0.5;
			this.posY =  rect.top + rect.height * 0.5;
			this.syncPos();
		}
	}
}

function _node_syncPos() {
	// var size = {width:this.textele.width(), height:this.textele.height()};
	this.dotele.center(this.posX, this.posY)
	this.textele.center(this.posX, this.posY)
	
	if(this.link){
		this.link.plot(this.posX, this.posY, this.prevNode.posX, this.prevNode.posY);
	}
}

function _node_float() {
	if(!this.phyObj.isStatic){
		var force = this.onPath ? 0.01 : 0.05;
		var x = force * (Math.random() - 0.5);
		var y = force * (Math.random() - 0.5);
		Physic.applyForce(this.phyObj, {x:x, y:y})
	}
}

function _node_mouseEnterDot() {
	var node = Nodes.getNodeByUid(this.attr('uid'));
    node.setStatus('text');
}

function _node_mouseLeaveText() {
	var node = Nodes.getNodeByUid(this.attr('uid'));
	if(!node.onPath){
		node.setStatus('dot');
	}
}



function _node_setStatus(status) {
	if(status == 'text'){
		this.dotele.hide();
		this.textele.show()
	}
	if(status == 'dot'){
		this.dotele.show();
		this.textele.hide()
	}
}

function generateUid(){
	var _uidLength = 12;
	var _uidSoup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  	var soupLength = _uidSoup.length;
  	var id = []
  	for (var i = 0; i < _uidLength; i++) {
    	id[i] = _uidSoup.charAt(Math.random() * soupLength);
  	}
  	return id.join('')
}