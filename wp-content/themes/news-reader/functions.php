<?php


/**
 * Load customizer
 */
require get_template_directory() . '/inc/customizer/class-customize.php';


/**
 * Implement the theme Core function
 */
require get_template_directory() . '/inc/core.php';


/**
 * Enqueue scripts and styles.
 */
function newsreader_enqueue_scripts() {
	/* FONTS*/
	
	wp_enqueue_style( 'newsreader-raleway', 'https://fonts.googleapis.com/css?family=Raleway:400,300,600,500');
	
	wp_enqueue_style( 'font-awesome', get_theme_file_uri( '/assets/css/font-awesome.css' ), '4.7.0' );
	
	/* PLUGIN CSS */
	wp_enqueue_style( 'bootstrap', get_theme_file_uri( '/assets/libs/bootstrap.css' ), '3.3.7' );
	wp_enqueue_style( 'bootstrap-theme', get_theme_file_uri( '/assets/libs/bootstrap-theme.css' ), '3.3.7' );
	wp_enqueue_style( 'magnific-popup', get_theme_file_uri( '/assets/css/magnific-popup.css' ), '3.3.7' );	
	
	wp_enqueue_style( 'owl-carousel', get_theme_file_uri( '/assets/css/owl.carousel.css' ), '3.3.7' );
	wp_enqueue_style( 'owl-theme', get_theme_file_uri( '/assets/css/owl.theme.css' ), '3.3.7' );
	wp_enqueue_style( 'owl-transitions', get_theme_file_uri( '/assets/css/owl.transitions.css' ), '3.3.7' );
		
	/* MAIN CSS */
	
	wp_enqueue_style( 'newsreader', get_stylesheet_uri() );

	//bootstrap.js
	wp_enqueue_script( 'bootstrap', get_theme_file_uri( '/assets/libs/bootstrap.js' ), array('jquery'), '3.3.4', true );
	wp_enqueue_script( 'magnific-popup', get_template_directory_uri().'/assets/js/jquery.magnific-popup.js', 0, 0,true );
	wp_enqueue_script( 'owl-carousel', get_theme_file_uri( '/assets/js/owl.carousel.js' ),0,0,true );
	wp_enqueue_script( 'newsreader', get_theme_file_uri( '/assets/js/newsreader.js' ), 0, 0,true );
	
	
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'newsreader_enqueue_scripts' );


/**
 * Load Theme Hooks
 */
require get_template_directory() . '/inc/post_hooks.php';

/**
 * Load override Hooks
 */
require get_template_directory() . '/inc/override.php';

/**
 * Load Widgets 
 */
require get_template_directory() . '/inc/wigets.php';

/**
 * Load Comment helper
 */
require get_template_directory() . '/inc/comment-helper.php';


/**
 * Load Walker Menu
 */
require get_template_directory() . '/inc/wp_bootstrap_navwalker.php';

/**
 * Additional features to allow styling of the templates.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Load Theme Hooks
 */
require get_template_directory() . '/inc/theme-hooks.php';

/**
 * Load Theme Hooks
 */
require get_template_directory() . '/inc/pro.php';

/**
 * Load Theme Hooks
 */
require get_template_directory() . '/vendors/breadcrumbs/breadcrumbs.php';

/**
 * Load Theme Hooks
 */
require get_template_directory() . '/inc/wp-admin/notices.php';



