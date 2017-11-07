<?php
/**
 * The template for displaying archive pages
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package News_Reader
 */

get_header(); ?>

<?php
/**
* Hook - newsreader_page_post_header_block.
*
* @hooked newsreader_page_post_header_block - 10
*/
do_action('newsreader_page_post_header_block');
/**
* Hook - newsreader_output_content_wrapper_before.
*
* @hooked newsreader_output_content_wrapper_before - 10
*/
do_action('newsreader_output_content_wrapper_before');
?>
	<div class="col-md-9 main_container">	
		<?php
		if ( have_posts() ) : ?>

			

			<?php
			/* Start the Loop */
			while ( have_posts() ) : the_post();

				/*
				 * Include the Post-Format-specific template for the content.
				 * If you want to override this in a child theme, then include a file
				 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
				 */
				get_template_part( 'template-parts/content', get_post_format() );

			endwhile;

			the_posts_pagination( array(
					'format' => '/page/%#%',
					'type' => 'list',
					'mid_size' => 2,
					'prev_text' => esc_html__( 'Previous', 'news-reader' ),
					'next_text' => esc_html__( 'Next', 'news-reader' ),
					'screen_reader_text' => esc_html__( '&nbsp;', 'news-reader' ),
				) );

		else :

			get_template_part( 'template-parts/content', 'none' );

		endif; ?>

		 </div>
        
        <div class="col-md-3">
        	<?php get_sidebar(); ?>
        </div>

	<?php
    /**
    * Hook - newsreader_output_content_wrapper_after.
    *
    * @hooked newsreader_output_content_wrapper_after - 10
    */
    do_action('newsreader_output_content_wrapper_after');
    ?>

<?php

get_footer();
