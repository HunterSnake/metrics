function initializeJS() {
    
    //sidebar dropdown menu
    jQuery('#sidebar .sub-menu > a').click(function () {
        jQuery('.menu-arrow').removeClass('arrow_carrot-down');
        jQuery('.menu-arrow').addClass('arrow_carrot-right');

        var sub = jQuery(this).next();
        var last = jQuery("#sidebar .sub:visible");
        console.log(last);
        
        if (sub.is(":visible")) {
            jQuery(this).children(".menu-arrow").addClass('arrow_carrot-right');
            sub.slideUp(200);
        } else {
            if(last && last !== sub){
                last.slideUp(200);
            }
            last = sub;
            jQuery(this).children(".menu-arrow").removeClass('arrow_carrot-right');
            jQuery(this).children(".menu-arrow").addClass('arrow_carrot-down');
            sub.slideDown(200);
        }
        var o = (jQuery(this).offset());
        //diff = 200 - o.top;
        // if(diff>0)
        //     jQuery("#sidebar").scrollTo("-="+Math.abs(diff),500);
        // else
        //     jQuery("#sidebar").scrollTo("+="+Math.abs(diff),500);
    });

    // sidebar menu toggle
    jQuery(function() {
        function responsiveView() {
            var wSize = jQuery(window).width();
            if (wSize <= 768) {
                jQuery('#container').addClass('sidebar-close');
                jQuery('#sidebar > ul').hide();
            }

            if (wSize > 768) {
                jQuery('#container').removeClass('sidebar-close');
                jQuery('#sidebar > ul').show();
            }
        }
        jQuery(window).on('load', responsiveView);
        jQuery(window).on('resize', responsiveView);
    });

    jQuery('.toggle-nav').click(function () {
        if (jQuery('#sidebar > ul').is(":visible") === true) {
            jQuery('#main-content').css({
                'margin-left': '0px'
            });
            jQuery('#sidebar').css({
                'margin-left': '-180px'
            });
            jQuery('#sidebar > ul').hide();
            jQuery("#container").addClass("sidebar-closed");
        } else {
            jQuery('#main-content').css({
                'margin-left': '180px'
            });
            jQuery('#sidebar > ul').show();
            jQuery('#sidebar').css({
                'margin-left': '0'
            });
            jQuery("#container").removeClass("sidebar-closed");
        }
    });

    // //bar chart
    // if (jQuery(".custom-custom-bar-chart")) {
    //     jQuery(".bar").each(function () {
    //         var i = jQuery(this).find(".value").html();
    //         jQuery(this).find(".value").html("");
    //         jQuery(this).find(".value").animate({
    //             height: i
    //         }, 2000)
    //     })
    // }

}

jQuery(document).ready(function(){
    initializeJS();
});