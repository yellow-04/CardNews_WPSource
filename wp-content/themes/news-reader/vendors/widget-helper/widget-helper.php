<?php
/**
 * Widget helper.
 *
 * @package Magazine_Point
 */

// Load widget helper class.
require_once get_template_directory() . '/vendors/widget-helper/class-widget-helper.php';

if( !function_exists('newsreader_point_widget_scripts') ):
/**
 * Enqueue widget scripts and styles.
 */
function newsreader_point_widget_scripts( $hook ) {

	$min = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

	if ( 'widgets.php' === $hook ) {

		// Color.
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'wp-color-picker' );
		wp_enqueue_script( 'underscore' );

		// Media.
		wp_enqueue_media();
		
	}

}

add_action( 'admin_enqueue_scripts', 'newsreader_point_widget_scripts' );
endif;
