<?php
/**
 * Portfolium functions and definitions
 *
 * Set up the theme and provides some helper functions, which are used in the
 * theme as custom template tags. Others are attached to action and filter
 * hooks in WordPress to change core functionality.
 *
 * When using a child theme you can override certain functions (those wrapped
 * in a function_exists() call) by defining them first in your child theme's
 * functions.php file. The child theme's functions.php file is included before
 * the parent theme's file, so the child theme functions would be used.
 *
 * @link http://codex.wordpress.org/Theme_Development
 * @link http://codex.wordpress.org/Child_Themes
 *
 * Functions that are not pluggable (not wrapped in function_exists()) are
 * instead attached to a filter or action hook.
 *
 * For more information on hooks, actions, and filters,
 * @link http://codex.wordpress.org/Plugin_API
 */

/**
 * Set up the content width value based on the theme's design.
 */
if (!isset($content_width)) {
	$content_width = 785;
}

/**
 * Portfolium only works in WordPress 3.6 or later.
 */
if (version_compare($GLOBALS['wp_version'], '3.6-alpha', '<'))
	require get_template_directory().'/inc/back-compat.php';

/**
 * Portfolium setup.
 *
 * Set up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support post thumbnails.
 */
function portfolium_setup() {
	/*
	 * Make Portfolium available for translation.
	 *
	 * Translations can be added to the /languages/ directory.
	 * If you're building a theme based on Portfolium, use a find and
	 * replace to change 'portfolium' to the name of your theme in all
	 * template files.
	 */
	load_theme_textdomain('portfolium', get_template_directory().'/languages');

	// Add RSS feed links to <head> for posts and comments.
	add_theme_support('automatic-feed-links');

	// Enable support for Post Thumbnails
	add_theme_support('post-thumbnails');

	// This theme uses wp_nav_menu()
	register_nav_menus(array(
		'header' => __('Header', 'portfolium')
	));

	// This theme uses its own gallery styles.
	add_filter('use_default_gallery_style', '__return_false');
}
add_action('after_setup_theme', 'portfolium_setup');

/**
 * Changes default image size when theme is activated
 */
function portfolium_thumbnail_size() {
	update_option('thumbnail_size_w', 145);
	update_option('thumbnail_size_h', 145);
	update_option('large_size_w', 785);
}
add_action('after_switch_theme', 'portfolium_thumbnail_size');

/**
 * Enqueue scripts and styles for the front end.
 *
 * @return void
 */
function portfolium_scripts() {
	if (is_singular() && comments_open() && get_option('thread_comments')) {
		wp_enqueue_script('comment-reply');
	}

	// Load our main stylesheet.
	wp_enqueue_style('portfolium-style', get_stylesheet_uri());

	// Custom styles
	$css = 'html {'.(is_admin_bar_showing() ? '
	height: -moz-calc(100% - 32px);
	height: -webkit-calc(100% - 32px);
	height: calc(100% - 32px);' : '
	height: 100%;').'
}';
	wp_add_inline_style('portfolium-style', $css);

	// Load the Internet Explorer specific stylesheet.
	wp_enqueue_style('portfolium-ie', get_template_directory_uri().'/ie.css', array('portfolium-style'), '20131217');
	wp_style_add_data('portfolium-ie', 'conditional', 'IE');

	if (is_singular()) {
		wp_enqueue_script('slideshow', get_template_directory_uri().'/js/jquery.cycle.all.min.js', array('jquery'), '20131217', false);
	}
	wp_enqueue_script('lazyload', get_template_directory_uri().'/js/jquery.lazyload.mini.js', array('jquery'), '20131217', false);
	wp_enqueue_script('portfolium-script', get_template_directory_uri().'/js/script.js', array('jquery'), '20131217', false);
}
add_action('wp_enqueue_scripts', 'portfolium_scripts');

/**
 * Custom Posts
 */
function portfolium_portfolio_init() {
	register_taxonomy(
		'works',
		'portfolio',
		array(
			'label' => __('Portfolio Categories', 'portfolium'),
			'singular_label' => __('Portfolio Category', 'portfolium'),
			'hierarchical' => true,
			'query_var' => true,
			'rewrite' => true,
			'show_in_nav_menus' => true,
		)
	);

	register_post_type(
		'portfolio',
		array(
			'label' => __('Portfolio', 'portfolium'),
			'singular_label' => __('Work', 'portfolium'),
			'public' => true,
			'show_ui' => true,
			'capability_type' => 'post',
			'hierarchical' => false,
			'rewrite' => true,
			'query_var' => true,
			'show_in_nav_menus' => true,
			'menu_position' => 3,
			'taxonomies' => array('portfolio'),
			'supports' => array('title', 'editor', 'author', 'thumbnail', 'custom-fields'),
			'_builtin' => false, // It's a custom post type, not built in!
		)
	);
}
add_action('init', 'portfolium_portfolio_init');

/**
 * Commentlist
 */
function commentlist($comment, $args, $depth) {
	$GLOBALS['comment'] = $comment;
	?>
	<li id="li-comment-<?php comment_ID() ?>">
		<div id="comment-<?php comment_ID(); ?>" <?php comment_class('comment_item clear'); ?>>
			<div class="comment_meta"><?php printf(__('Posted on %s by <cite class="fn">%s</cite>', 'portfolium'), get_comment_date(), get_comment_author_link()); ?></div>
			<div class="comment_text"><?php comment_text() ?></div>
		</div>
	<?php
}

function commentdata_fix($commentdata) {
	if ($commentdata['comment_author_url'] == 'WWW') {
		$commentdata['comment_author_url'] = '';
	}
	if ($commentdata['comment_content'] == 'Write your comment') {
		$commentdata['comment_content'] = '';
	}
	return $commentdata;
}
add_filter('preprocess_comment', 'commentdata_fix');

function getTinyUrl($url) {
	$remote = wp_remote_get('http://tinyurl.com/api-create.php?url='.$url);
	if ($remote instanceof WP_Error || $remote['response']['code'] != 200) {
		return 'tinyurl-error';
	}
	return $remote['body'];
}

function get_blogurl() {
	if (get_option('show_on_front') == 'page' && get_option('page_for_posts') != 0) {
		$blogpage = get_page(get_option('page_for_posts'));
		echo $blogpage->guid;
	}
	else {
		echo home_url();
	}
}

function catlist() {
	?>
	<ul class="tags jsddm">
		<li>
			<a href="#">Blog categories</a>
			<ul class="taglist">
				<?php wp_list_categories('title_li=&hierarchical=0&'); ?>
			</ul>
		</li>
	</ul>
	<?php
}

function n_posts_link_attributes() {
	return 'class="nextpostslink"';
}
function p_posts_link_attributes() {
	return 'class="previouspostslink"';
}
add_filter('next_posts_link_attributes', 'n_posts_link_attributes');
add_filter('next_comments_link_attributes', 'n_posts_link_attributes');
add_filter('previous_posts_link_attributes', 'p_posts_link_attributes');
add_filter('previous_comments_link_attributes', 'p_posts_link_attributes');
