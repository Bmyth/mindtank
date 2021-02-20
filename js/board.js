var Board = {
	init: _board_init,
	show: _board_show,
	enter: _board_enter,
	update: _board_update,
	editNode: _board_editNode,
	release: _board_release,
	close: _board_close,
	getNodeEle: _board_getNodeEle,
	onEdit: false,
	onEditNode: null,
	ele: null,
	textEle: null
}

function _board_init(){
	Board.ele = $('#board').hide();
	Board.textEle = $('#board p');
	_board_update();
}

function _board_show() {
	Board.onEdit = true;
	Board.ele.fadeIn();
	_board_update();
}

function _board_enter() {
	Nodes.addNode(Entry.ele.val());
	Board.onEdit = false;
	Board.ele.fadeOut();
}

function _board_update() {

	Board.textEle.text(Entry.ele.val());
	_board_updateCss();
}

function _board_editNode(uid) {
	var node = Nodes.getNodeByUid(uid);
	Nodes.onEditNode = node;
	var text = Model.getText(node.nid);
	Entry.ele.val(text).focus();
	_board_show();
}

function _board_release() {
	var span = Board.ele.find('span').last().clone();
	Board.ele.empty();
	Entry.ele.val('');
	span.appendTo(Board.ele)
	Nodes.releaseNodes();
	_board_updateTop();
	Nodes.updateBoardNodes();
}


function _board_updateCss() {
	var lEleMin = 70;
	var padding = 5;
	var rect = Board.textEle[0].getBoundingClientRect();
	var w = rect.width;
	var h = rect.height;
	var wEle = Math.max(w + padding * 2, lEleMin);
	var left = (windowWidth - wEle) * 0.5;
	var top  = (windowHeight - wEle) * 0.5;
	var topText = (wEle - h) * 0.5;
	var leftText = (wEle - w) * 0.5;

	Board.ele.css({width:wEle,height:wEle,left:left,top:top});	
	Board.textEle.css({top:topText, left: leftText})
}

function _board_close() {
	Board.ele.html('');
	Board.ele.fadeOut();
}

function _board_getNodeEle(uid) {
	var ele = Board.ele.find('[uid=' + uid + ']');
	if(ele.length == 0){
		return null;
	}else{
		return ele;
	}
}

// function _board_getMapPos(point) {
// 	var w = Board.ele.width();
// 	var h = Board.ele.height();
// 	var marginLeft = (windowWidth - w) * 0.5;
// 	var marginTop = (windowHeight - h) * 0.5;
// 	var mapRectSize  = 100;
// 	var x = (marginLeft - mapRectSize) + (point.x - marginLeft) / w * mapRectSize;
// 	var y = (marginTop - mapRectSize) + (point.y - marginTop) / h * mapRectSize;
// 	return {x:x, y:y}
// }
