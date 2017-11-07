<?php if (comments_open()): ?>
<div id="comments">
	<?php if (post_password_required()): ?>
	<p class="nopassword"><?php _e('This post is password protected. Enter the password to view any comments.', 'portfolium'); ?></p>
</div><!-- #comments -->
	<?php
	/* Stop the rest of comments.php from being processed,
	 * but don't kill the script entirely -- we still have
	 * to fully load the template.
	 */
	return; endif;
	?>

	<div class="comments_heading clear">
		<div class="add_comment"><a href="#respond">Add your comment</a></div>
		<div class="comment_qty"><?php
			printf(_n('One Response to %2$s', '%1$s Responses to %2$s', get_comments_number()),
				number_format_i18n(get_comments_number()), 'this post');
			?></div>
	</div>

	<?php if (have_comments()): ?>

	<div class="comment_list">
		<ol>
			<?php wp_list_comments(array('callback' => 'commentlist')); ?>
		</ol>
	</div>

	<?php endif; // end have_comments() ?>

	<?php if (get_comment_pages_count() > 1 && get_option('page_comments')) : ?>
	<nav id="comment-nav-below" class="navigation comment-navigation pagination" role="navigation">
		<div class="pagination_ctrl">
			<?php previous_comments_link(' '); ?>
			<?php next_comments_link(' '); ?>
		</div>
	</nav><!-- #comment-nav-below -->
	<?php endif; // Check for comment navigation. ?>

	<?php if ('open' == $post->comment_status): ?>

	<?php comment_form(array(
		'must_log_in' => '<p class="comment_message">'
			.sprintf('You must be <a href="%s">logged in</a> to post a comment.',
				get_option('siteurl').'/wp-login.php?redirect_to='.urlencode(get_permalink()))
			.'</p>',
		'logged_in_as' => '<p class="comment_message">
			'.sprintf('Logged in as <a href="%s">%s</a>. <a href="%s" title="Log out of this account">Log out &raquo;</a>',
				get_option('siteurl').'/wp-admin/profile.php',
				$user_identity,
				wp_logout_url(get_permalink()))
			.'</p>',
		'comment_notes_before' => '',
		'comment_notes_after' => '',
		'title_reply' => __('Add your comment', 'portfolium'),
		'label_submit' => __('Post your comment', 'portfolium'),
		'comment_field' => '<p><textarea name="comment" class="focus" id="comment" cols="100%" rows="10" tabindex="4" onfocus="if(this.innerHTML==\''.__('Write your comment', 'portfolium').'\') this.innerHTML=\'\';">'.__('Write your comment', 'portfolium').'</textarea></p>',
		'fields' => apply_filters('comment_form_default_fields', array(
			'author' =>
				'<input class="focus" type="text" name="author" id="author" onfocus="if(this.value==\'Name\') this.value=\'\';" onblur="if(this.value==\'\') this.value=\'Name\';" value="Name" size="22" tabindex="1" />',

			'email' =>
				'<input class="focus" type="text" name="email" id="email" onfocus="if(this.value==\'Email\') this.value=\'\';" onblur="if(this.value==\'\') this.value=\'Email\';" value="Email" size="22" tabindex="2" />',

			'url' =>
				'<input class="focus" type="text" name="url" id="url" onfocus="if(this.value==\'WWW\') this.value=\'\';" onblur="if(this.value==\'\') this.value=\'WWW\';" value="WWW" size="22" tabindex="3" />',
		))
	)); ?>

	<?php endif; // if you delete this the sky will fall on your head ?>
<?php endif; // end ! comments_open() ?>
<!-- #comments -->
