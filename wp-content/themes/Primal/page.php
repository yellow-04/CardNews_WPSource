<?php get_header(); ?>

<div id="content">

<?php if (have_posts()) : ?>
<?php while (have_posts()) : the_post(); ?>
		
<div class="post" id="post-<?php the_ID(); ?>">

	<div class="title">
		<h2><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>
	</div>

	<div class="entry">
		<?php the_content('Read the rest of this entry &raquo;'); ?>
		<div class="clear"></div>
		<?php wp_link_pages(array('before' => '<p><strong>Pages: </strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>
	</div>

</div>

<?php endwhile; endif; ?>
</div>		


<?php get_footer(); ?>