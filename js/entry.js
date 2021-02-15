var Entry = {
	init: _entry_init,
    ele: null,
    isEditNode: false,
    value: ''
}

function _entry_init(){
    Entry.ele = $('#entry');
    Entry.ele.focus();
    Entry.ele.on('keyup', _entry_Keyup);
    Entry.ele.on('compositionend', _entry_compositionend);
}

function _entry_Keyup(e){
	var e  = e ||  window.e;          
　　	var key = e.keyCode || e.which;

	// console.log(key)
    // left
    if(key == '37'){
        _entry_direction('left', event.shiftKey);
    }
    // right
    else if(key == '39'){
        _entry_direction('right', event.shiftKey);
    }
    // up
    else if(key == '38'){
        _entry_direction('up', event.shiftKey);
    }
    // down
    else if(key == '40'){
        _entry_direction('down', event.shiftKey);
    }else if(key == '27'){
        _entry_esc();
    }else{
        _entry_compositionend();
    }
}

function _entry_compositionend() {
    var val = Entry.ele.val();
    var lastInput = val.substr(-1);
    var isToggleNode = lastInput == '@';
    var isRelease = val.indexOf('7') >= 0;
    if(isToggleNode){
        Board.update('@');
        Entry.ele.val('');
    }else if(isRelease){
        Entry.ele.val('');
        Board.release();
    }else{
        Board.update(Entry.ele.val());
    }
}

function _entry_esc() {
    Entry.ele.val('');
    Board.close();
}


function _entry_direction(direction, shiftKey) {
	var step = 40;
	var mode = shiftKey ? 'Parallel' : 'Serial';
	if(entry.val()){
		Nodes.createNode({direction:direction, mode:mode});
	}else{
		var dx = DirectionConfig[direction].iX * step;
		var dy = DirectionConfig[direction].iY * step;
		tempNode && tempNode.adjustPos({x:dx, y:dy});
	}
}