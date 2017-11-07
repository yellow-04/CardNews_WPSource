jQuery(document).ready(function() {

jQuery('.squarebanner ul li:nth-child(even)').addClass('rbanner');

/* Navigation */
 jQuery('#submenu ul.sfmenu').superfish({ 
		delay:       500,								// 0.1 second delay on mouseout 
		animation:   {height:'show'},	// fade-in and slide-down animation 
		dropShadows: true								// disable drop shadows 
	});	 

	
});