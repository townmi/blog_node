
 // Calling the function
$(function() {
    $('#js_toggle_nav').click(function() {
        $("body").toggleClass("background_blur");
        var bars = $("#bars");
        if(bars.hasClass("to_arrow")){
            bars.removeClass().addClass("from_arrow");
        }else{
            bars.removeClass().addClass("to_arrow");
        }
        toggleNavigation();
    });
});


// The toggleNav function itself
function toggleNavigation() {
    if ($('#container').hasClass('display_nav')) {
        // Close Nav
        $('#container').removeClass('display_nav');
    } else {
        // Open Nav
        $('#container').addClass('display_nav');
    }
}




