<?php get_header(); ?>

<div class="page_meta clear">
	<div class="rss">
		<a href="<?php bloginfo('rss2_url'); ?>"><?php _e('Subscribe to RSS feed', 'portfolium'); ?></a>
	</div>
	<div class="heading">
		<h3><?php _e('Latest from blog', 'portfolium'); ?></h3>
	</div>
	<?php if (function_exists('catlist')) catlist(); ?>
	<?php get_search_form(); ?>
</div>

<div class="posts">
	<?php get_template_part('loop'); // Loop template (loop.php) ?>
	<?php get_template_part('pagination'); // Pagination template for WP-PageNavi support (pagination.php) ?>
</div>

<?php get_footer(); ?>
