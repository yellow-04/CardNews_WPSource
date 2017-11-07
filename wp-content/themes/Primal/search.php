<?php get_header(); ?>

<div id="content">

<?php if (have_posts()) : ?>
<?php while (have_posts()) : the_post(); ?>
		
<div class="post" id="post-<?php the_ID(); ?>">

<div class="clearfix">
	<div class="l-entry">
	<div class="lmeta">Posted on <span><?php the_time('M - j - Y'); ?></span></div>
	<div class="lmeta">Posted by <span><?php the_author(); ?></span></div>

	</div>

	<div class="entry r-entry">
		<div class="title">
			<h2><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>
		</div>
		<?php wpe_excerpt('wpe_excerptlength_index', ''); ?>
		<div class="clear"></div>
	</div>
</div>


</div>
<?php endwhile; ?>

<?php getpagenavi(); ?>

<?php else : ?>

	<h1 class="title">Not Found</h1>
	<p>Sorry, but you are looking for something that isn't here.</p>

<?php endif; ?>

</div>

<?php get_footer(); ?>