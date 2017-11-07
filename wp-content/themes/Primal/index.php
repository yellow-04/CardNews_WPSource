<?php get_header(); ?>

<div id="content">
<?php if (have_posts()) : ?>
<?php while (have_posts()) : the_post(); ?>

<div class="box" id="post-<?php the_ID(); ?>">
	<div class="boxim">
		<a href="<?php the_permalink() ?>"><img class="boxthumb" src="<?php bloginfo('stylesheet_directory'); ?>/timthumb.php?src=<?php get_image_url(); ?>&amp;h=150&amp;w=210&amp;zc=1" alt=""/></a>
	</div>
	<div class="boxmeta clearfix">
		<h2><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a></h2>
		<div class="blike"><?php printLikes(get_the_ID()); ?></div>
		<div class="scomm"><?php comments_popup_link('0 Comment', '1 Comment', '% Comments'); ?></div>
	</div>
</div>

<?php endwhile; ?>
<div class="clear"></div>
<?php getpagenavi(); ?>
<?php else : ?>
		<h1 class="title">Not Found</h1>
		<p>Sorry, but you are looking for something that isn't here.</p>
<?php endif; ?>
  </div>
<?php get_footer(); ?>