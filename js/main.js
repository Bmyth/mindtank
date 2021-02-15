var windowWidth, windowHeight;

$(function() {
	windowWidth = $(window).width();
    windowHeight = $(window).height();
    console.log(windowWidth,windowHeight)

    $("#paper").css({
        width: windowWidth + 'px',
        height: windowHeight + 'px'
    })
    var FrontPaper = new paper.PaperScope();
    FrontPaper.setup($("#paper")[0]);
    FrontPaper.install(window);
    
    Physic.init();
    Entry.init();
    Board.init();
    Nodes.init();
});





