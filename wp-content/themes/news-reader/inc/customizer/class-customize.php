<?php
/**
 * Singleton class for handling the theme's customizer integration.
 *
 * @since  1.0.0
 * @access public
 */
final class NewsReaderCustomize {

	/**
	 * Returns the instance.
	 *
	 * @since  1.0.0
	 * @access public
	 * @return object
	 */
	public static function get_instance() {

		static $instance = null;

		if ( is_null( $instance ) ) {
			$instance = new self;
			$instance->setup_actions();
		}

		return $instance;
	}

	/**
	 * Constructor method.
	 *
	 * @since  1.0.0
	 * @access private
	 * @return void
	 */
	private function __construct() {}

	/**
	 * Sets up initial actions.
	 *
	 * @since  1.0.0
	 * @access private
	 * @return void
	 */
	private function setup_actions() {

		// Register panels, sections, settings, controls, and partials.
		add_action( 'customize_register', array( $this, 'sections' ) );

		// Register scripts and styles for the controls.
		add_action( 'customize_controls_enqueue_scripts', array( $this, 'newsreader_enqueue_control_scripts' ), 0 );
	}

	/**
	 * Sets up the customizer sections.
	 *
	 * @since  1.0.0
	 * @access public
	 * @param  object  $manager
	 * @return void
	 */
	public function sections( $manager ) {


		// Load custom sections.
		//require_once( trailingslashit( get_template_directory() ) . 'inc/customizer/section-pro.php' );
		locate_template( 'inc/customizer/section-pro.php', TRUE, TRUE );
		
		/*
		Start newsreader Options
		=====================================================
		*/
		$manager->add_section( 'newsreader_options', array(
			 'title'    => esc_attr__( 'Lite Theme Options', 'news-reader' ),
			 'priority' => 0,
		) );
		
		/*
		Show social on header
		*/
		$manager->add_setting('newsreader_theme_options_socialheader', array(
			'default' => 1,
			'type'       => 'theme_mod',
			'capability' => 'edit_theme_options',
			'sanitize_callback' => array( $this,'newsreader_sanitize_checkbox')
		) );
		
		$manager->add_control('newsreader_theme_options_socialheader', array(
			'label'      => __( 'Show Social Buttons on Header', 'news-reader' ),
			'section'    => 'newsreader_options',
			'settings'   => 'newsreader_theme_options_socialheader',
			'type'       => 'checkbox',
		) );
		
		/*
		Show social on footer
		*/
		$manager->add_setting('newsreader_theme_options_socialfooter', array(
			'default'    => 1,
			'type'       => 'theme_mod',
			'capability' => 'edit_theme_options',
			'sanitize_callback' => array( $this,'newsreader_sanitize_checkbox')
		) );
		
		$manager->add_control('newsreader_theme_options_socialfooter', array(
			'label'      => __( 'Show Social Buttons on Footer', 'news-reader' ),
			'section'    => 'newsreader_options',
			'settings'   => 'newsreader_theme_options_socialfooter',
			'type'       => 'checkbox',
		) );
		
		
		
		/*
		Show full post or excerpt
		=====================================================
		*/
		$manager->add_setting('newsreader_theme_options_blog_list_content', array(
			'default'    => 'excerpt',
			'type'       => 'theme_mod',
			'capability' => 'edit_theme_options',
			'sanitize_callback' => array( $this,'newsreader_sanitize_select')
		) );
		
		$manager->add_control('newsreader_theme_options_postshow', array(
			'label'      => __( 'Blog List Content Type', 'news-reader' ),
			'section'    => 'newsreader_options',
			'settings'   => 'newsreader_theme_options_blog_list_content',
			'type'       => 'select',
			'choices' => array(
				'excerpt' => __( 'excerpt', 'news-reader'),
				'full' => __( 'full post', 'news-reader'),
				
			),
		) );
		
		$newsreader_options=array();
		
		
		/*
		Social media
		*/
		$newsreader_options['social']['fa-facebook']= array(
			'label' => __('Facebook URL', 'news-reader')
		);
		$newsreader_options['social']['fa-twitter']= array(
			'label' => __('Twitter URL', 'news-reader')
		);
		$newsreader_options['social']['fa-linkedin']= array(
			'label' => __('Linkedin URL', 'news-reader')
		);
		$newsreader_options['social']['fa-google-plus']= array(
			'label' => __('Google-plus URL', 'news-reader')
		);
		$newsreader_options['social']['fa-pinterest']= array(
			'label' => __('pinterest URL', 'news-reader')
		);
		$newsreader_options['social']['fa-youtube']= array(
			'label' => __('Youtube URL', 'news-reader')
		);
		$newsreader_options['social']['fa-instagram']= array(
			'label' => __('Instagram URL', 'news-reader')
		);
		$newsreader_options['social']['fa-reddit']= array(
			'label' => __('Reddit URL', 'news-reader')
		);
		
		/*
		Footer
		*/
		$newsreader_options['footer']['copyright']= array(
			'default' =>'',
			'label' => __('Copyright Text', 'news-reader')
		);
		
		foreach( $newsreader_options as $key => $options ):
			foreach( $options as $k => $val ):
				// SETTINGS
				$manager->add_setting('newsreader_theme_options['.$key .']['. $k .']',
					array(
						///'default' => $val['default'],
						'capability'     => 'edit_theme_options',
						'sanitize_callback' => 'sanitize_text_field',
						'type'     => 'theme_mod',
					)
				);
				// CONTROLS
				$manager->add_control('newsreader_theme_options_text_field_' . $k , 
					array(
						'label' => $val['label'], 
						'section'    => 'newsreader_options',
						'settings' =>'newsreader_theme_options['.$key .']['. $k .']',
					)
				);
			
			endforeach;
		endforeach;

		// Register custom section types.
		$manager->register_section_type( 'NewsReaderCustomize_Section_Pro' );
		// Register sections.
		$manager->add_section(
			new NewsReaderCustomize_Section_Pro(
				$manager,
				'newsreader_pro',
				array(
					'title'    => esc_html__( 'News Reader Pro', 'news-reader' ),
					'pro_text' => esc_html__( 'Go Pro',         'news-reader' ),
					'pro_url'  => 'https://edatastyle.com/product/newsreader-news-blog-magazine-wordpress-theme/'
				)
			)
		);
	}

	/**
	 * Loads theme customizer CSS.
	 *
	 * @since  1.0.0
	 * @access public
	 * @return void
	 */
	public function newsreader_enqueue_control_scripts() {

		wp_enqueue_script( 'newsreader_customize_controls', trailingslashit( get_template_directory_uri() ) . 'inc/customizer/customize-controls.js', array( 'customize-controls' ) );

		wp_enqueue_style( 'newsreader_customize_controls', trailingslashit( get_template_directory_uri() ) . 'inc/customizer/customize-controls.css' );
	}
	
	public function newsreader_sanitize_checkbox( $input ) {
		if ( $input == 1 ) {
			return 1;
		} else {
			return '';
		}
	}
	function newsreader_sanitize_select( $input ) {
		return wp_filter_nohtml_kses( $input );
	}
}

// Doing this customizer thang!
NewsReaderCustomize::get_instance();
