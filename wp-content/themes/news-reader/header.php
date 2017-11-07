<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package News_Reader
 */

?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<script src="http://www.google.com/jsapi"></script>
<script>
	google.load("webfont", "1");
	google.setOnLoadCallback(function(){
		WebFont.load({custom:{
			families: ['NanumGothic'],
			urls: ['../fonts/NanumGothic.css']
		}});
	});
</script>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="profile" href="http://gmpg.org/xfn/11">

<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php
/**
* Hook - newsreader_header_container.
*
* @hooked newsreader_header_before - 10
* @hooked newsreader_header_top_bar - 11
* @hooked newsreader_header_container - 12
* @hooked newsreader_add_primary_navigation - 13
* @hooked newsreader_header_after - 14
*/
do_action( 'newsreader_header_container' );
?>
