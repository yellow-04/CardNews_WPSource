<?php

/*Add theme menu page*/
 
if( !function_exists('newsreader_admin_menu') ): 
	add_action('admin_menu', 'newsreader_admin_menu');
	
	function newsreader_admin_menu() {
		
		$newsreader_page_title = esc_html__("NewsReader Premium",'news-reader');
		
		$newsreader_menu_title = esc_html__("NewsReader Premium",'news-reader');
		
		add_theme_page($newsreader_page_title, $newsreader_menu_title, 'edit_theme_options', 'newsreader_pro', 'newsreader_pro_page');
		
	}

endif;
/*
**
** Premium Theme Feature Page
**
*/

if( !function_exists('newsreader_pro_page') ):
function newsreader_pro_page(){
	if ( is_admin() ) {
		require get_template_directory() . '/inc/premium-screen/index.php';
	} 
}
endif;

if( !function_exists('newsreader_admin_script') ){
function newsreader_admin_script($newsreader_hook){
	
	if($newsreader_hook != 'appearance_page_newsreader_pro') {
		return;
	} 
    wp_enqueue_style( 'font-awesome', get_template_directory_uri() . '/assets/css/font-awesome.css' );
	wp_enqueue_style( 'newsreader-pro-custom-css', get_template_directory_uri() .'/inc/premium-screen/pro-custom.css',array(),'1.0' );

}

add_action( 'admin_enqueue_scripts', 'newsreader_admin_script' );
}


