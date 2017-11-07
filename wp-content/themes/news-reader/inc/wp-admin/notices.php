<?php 
/**
 * News Reader functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package News_Reader
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'newsreader_Admin' ) ) :

/**
 * newsreader_Admin Class.
 */
class newsreader_Admin {

	/**
	 * Constructor.
	 */
	public function __construct() {
		
		add_action( 'wp_loaded', array( __CLASS__, 'hide_notices' ) );
		add_action( 'load-themes.php', array( $this, 'admin_notice' ) );
	}

	/**
	 * Add admin notice.
	 */
	public function admin_notice() {
		global $pagenow;

		wp_enqueue_style( 'newsreader-message', get_template_directory_uri() . '/inc/wp-admin/message.css', array(), '1.0' );

		// Let's bail on theme activation.
		if ( 'themes.php' == $pagenow && isset( $_GET['activated'] ) ) {
			add_action( 'admin_notices', array( $this, 'welcome_notice' ) );
			update_option( 'newsreader_admin_notice_welcome', 1 );

		// No option? Let run the notice wizard again..
		} elseif( ! get_option( 'newsreader_admin_notice_welcome' ) ) {
			add_action( 'admin_notices', array( $this, 'welcome_notice' ) );
		}
	}

	/**
	 * Hide a notice if the GET variable is set.
	 */
	public static function hide_notices() {
		if ( isset( $_GET['newsreader-hide-notice'] ) && isset( $_GET['_newsreader_notice_nonce'] ) ) {
			if ( ! wp_verify_nonce( wp_unslash($_GET['_newsreader_notice_nonce']), 'newsreader_hide_notices_nonce' ) ) {
				/* translators: %s: plugin name. */
				wp_die( esc_html__( 'Action failed. Please refresh the page and retry.', 'news-reader' ) );
			}

			if ( ! current_user_can( 'manage_options' ) ) 
			/* translators: %s: plugin name. */{
				wp_die( esc_html__( 'Cheatin&#8217; huh?', 'news-reader' ) );
			}

			$hide_notice = sanitize_text_field( wp_unslash( $_GET['newsreader-hide-notice'] ) );
			update_option( 'newsreader_admin_notice_' . $hide_notice, 1 );
		}
	}

	/**
	 * Show welcome notice.
	 */
	public function welcome_notice() {
		?>
		<div id="message" class="updated cresta-message">
			<a class="cresta-message-close notice-dismiss" href="<?php echo esc_url( wp_nonce_url( remove_query_arg( array( 'activated' ), add_query_arg( 'newsreader-hide-notice', 'welcome' ) ), 'newsreader_hide_notices_nonce', '_newsreader_notice_nonce' ) ); ?>"><?php  /* translators: %s: plugin name. */ esc_html_e( 'Dismiss', 'news-reader' ); ?></a>
			<p><?php printf( /* translators: %s: plugin name. */  esc_html__( 'Welcome! Thank you for choosing NewsReader! To fully take advantage of the best our theme can offer please make sure you visit our %1$s Offerpage%2$s.', 'news-reader' ), '<a href="' . esc_url( admin_url( 'themes.php?page=newsreader_pro' ) ) . '">', '</a>' ); ?></p>
			
		</div>
		<?php
	}

	
	
}

endif;

return new newsreader_Admin();
