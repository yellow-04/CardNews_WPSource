<?php get_header(); ?>

<div id="content" >

<?php if (have_posts()) : ?>
<?php while (have_posts()) : the_post(); ?>

<div class="post" id="post-<?php the_ID(); ?>">

<a href="<?php the_permalink() ?>"><img class="postimg" src="<?php bloginfo('stylesheet_directory'); ?>/timthumb.php?src=<?php get_image_url(); ?>&amp;h=250&amp;w=680&amp;zc=1" alt=""/></a>

<div class="clearfix">
	<div class="l-entry">
	<div class="lmeta">Posted on <span><?php the_time('M - j - Y'); ?></span></div>
	<div class="lmeta">Posted by <span><?php the_author(); ?></span></div>
	<div class="lmeta">Categories <span> <?php the_category(', '); ?> </span></div>
	</div>

	<div class="entry r-entry">
		<div class="title">
			<h2><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>
		</div>
		<?php the_content('Read the rest of this entry &raquo;'); ?>
		<div class="clear"></div>
		<?php wp_link_pages(array('before' => '<p><strong>Pages: </strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>
	</div>
</div>

</div>

<?php comments_template(); ?>
<?php endwhile; endif; ?>
</div>

<?php get_footer(); ?>