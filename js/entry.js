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
    $('body').on('click', _entry_click);
}

function _entry_Keyup(e){
	var e  = e ||  window.e;          
　　	var key = e.keyCode || e.which;

	// console.log(key)
    if(key == '13'){
        _entry_enter();
    }
    // left
    else if(key == '37'){
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
    }
    else if(key == '27'){
        _entry_esc();
    }else{
        _entry_compositionend();
    }
}

function _entry_compositionend() {
    var val = Entry.ele.val();
    var lastInput = val.substr(-1);
    Nodes.focused && Nodes.focused.updateText(Entry.ele.val());
}

function _entry_enter() {
    Nodes.enter();
}

function _entry_esc() {
    Entry.ele.val('');
    Board.close();
}

function _entry_click(e) {
    if(e.target.tagName == 'svg'){
        Entry.ele.val('').focus();
        Nodes.focusNode('temp');
    }
}