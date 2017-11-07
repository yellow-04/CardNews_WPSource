<?php get_header(); ?>

<?php query_posts(array('post_type' => 'portfolio', 'posts_per_page' => -1)); ?>

<?php get_template_part('loop-portfolio'); // Loop template for portfolio (loop-portfolio.php) ?>
<?php wp_reset_query(); ?>

<?php get_footer(); ?>
