var windowWidth, windowHeight;
var draw;
$(function() {
	windowWidth = $(window).width();
    windowHeight = $(window).height();

    $("body").css({
        width: windowWidth + 'px',
        height: windowHeight + 'px'
    })
    // var FrontPaper = new paper.PaperScope();
    // FrontPaper.setup($("#paper")[0]);
    // FrontPaper.install(window);


    $("#svgpaper").css({
        width: windowWidth + 'px',
        height: windowHeight + 'px'
    })
    draw = SVG().addTo('#svgpaper').size('100%', '100%')
    
    Model.init();
    Physic.init();
    Entry.init();
    Board.init();
    Nodes.init();
});





