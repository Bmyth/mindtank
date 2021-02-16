var minNodeDistance = 100;
function Node(params){
	var node = new Group();
	node.uid = generateUid();
	node.uiGroup = new Group();
	
	node.ele = $('<p class="node"></p>').appendTo(Nodes.ele);
	node.onBoard = params.textele ? true : false;
	node.nid = params.nid;
	node.prevUid = params.prevuid;

	node.ele.text(Model.getText(node.nid))

	var x,y;

	if(node.onBoard){
		var textEleRect = params.textele[0].getBoundingClientRect();
		x = textEleRect.left + textEleRect.width * 0.5;
		y = textEleRect.top + textEleRect.height * 0.5;
	}else{
		x = windowWidth * Math.random();
		y = windowHeight * Math.random();
	}
	
	node.posX = x;
	node.posY = y;

	var rect = node.ele[0].getBoundingClientRect();
	var	uiFrame =  new Path.Rectangle({
    	size: [rect.width, rect.height],
    	strokeColor: '#666',
    	strokeWidth: 1,
    	opacity: 0
    });
    uiFrame.bringToFront();
    uiFrame.name = 'frame';
    node.uiGroup.addChild(uiFrame);
	
	if(node.prevUid){
		node.prevNode = Nodes.getNodeByUid(node.prevUid);
		var link = new Path.Line({
		    from: [node.posX, node.posY],
		    to: [node.prevNode.posX, node.prevNode.posY],
		    strokeColor: '#333',
		    strokeWidth: 0.5
		});
		link.dashArray = [10, 4];
		link.name = 'link';
		node.uiGroup.addChild(link);
		link.sendToBack();
	}

	var prevObj = node.prevNode ? node.prevNode.phyObj : null;

	var isStatic = node.onBoard;
	node.phyObj = Physic.addObj({
		x: x,
		y: y,
		w: rect.width,
		h: rect.height,
		isStatic: isStatic,
		frictionAir: 0.01
	},prevObj);
	node.phyObj.mass = 10;

	node.onFrame = _node_onFrame;
	node.release = _node_release;
	node.updateBoardElePos = _node_updateBoardElePos;
	node.syncPos = _node_syncPos;
	node.float = _node_float;

	node.syncPos();
	return node;
}

function _node_onFrame(i) {
	var x,y;
	if(this.onBoard){
		x = this.posX;
		y = this.posY;
	}else{
		x = this.phyObj.position.x;
		y = this.phyObj.position.y;
	}
	if(this.posX != x || this.posY != y){
		this.posX = x;
		this.posY = y;
		this.syncPos();
	}
}

function _node_release() {
	this.onBoard = false;
	Physic.setStatic(this.phyObj, false)
}

function _node_updateBoardElePos(boardEle){
	var rect = boardEle[0].getBoundingClientRect();
	this.posX = rect.left + rect.width * 0.5;
	this.posY =  rect.top + rect.height * 0.5;
	this.syncPos();
}

function _node_syncPos() {
	var uiFrame = this.uiGroup.children['frame'];
	var rect = this.ele[0].getBoundingClientRect();
	uiFrame.position.x = parseInt(this.posX);
	uiFrame.position.y = parseInt(this.posY);
	this.ele.css({left: this.posX - rect.width * 0.5, top: this.posY - rect.height * 0.5})

	if(this.prevNode){
		var link = this.uiGroup.children['link'];
		link.segments[0].point.x = this.posX;
		link.segments[0].point.y = this.posY;
		link.segments[1].point.x = this.prevNode.posX;
		link.segments[1].point.y = this.prevNode.posY;
	}
}

function _node_float() {
	var force = 0.02;
	var x = force * (Math.random() - 0.5);
	var y = force * (Math.random() - 0.5);
	Physic.applyForce(this.phyObj, {x:x, y:y})
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