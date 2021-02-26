var windowWidth, windowHeight, centerX, centerY, centerPoint;
var draw;
var Comp = {};

$(function() {
	windowWidth = $(window).width();
    windowHeight = $(window).height();
    centerX = windowWidth * 0.5;
    centerY = windowHeight * 0.5;
    centerPoint = {x:centerX,y:centerY};

    $("body").css({
        width: windowWidth + 'px',
        height: windowHeight + 'px'
    })

    $("#svgpaper").css({
        width: windowWidth + 'px',
        height: windowHeight + 'px'
    })
    draw = SVG().addTo('#svgpaper').size('100%', '100%')

    Model.init();
    Physic.init();
    Entry.init();
    Nodes.init();
});





