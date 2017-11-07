<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$imageURL = esc_url($_REQUEST['image']);
$wp_postname = $wpdb->prefix.'posts';
$query = 'SELECT ID FROM '.$wp_postname.' WHERE guid ="'.$imageURL.'"';
$rows = $wpdb->get_results($query);
if (!empty($rows)) {
    foreach ($rows as $name => $value) {
        $imageID = $value->ID;
    }
    $ID = $_REQUEST['postID'];
    $data = esc_attr($_REQUEST['base64data']);
    $image = explode('base64,', $data);
    $action = sanitize_text_field($_REQUEST['queryAction']);
    $image_path = get_attached_file($imageID);
    $image_url = esc_url($_REQUEST['image']);
    // check if file with same name exists in upload path, rename file
    if ($action == "copy") {
        $new_image_path = $image_path;
        while (file_exists($new_image_path)) {
            $num = rand(1, 99);
            $new_image_path = urldecode(dirname($image_path) . '/' . $num . '_' . $imageURL);
            $new_image_url = urldecode(dirname($image_url) . '/' . $num . '_' . $imageURL);
        }
        file_put_contents($new_image_path, base64_decode($image[1]));
        $filename = $new_image_path;
        // The ID of the post this attachment is for.
        $parent_post_id = $ID;
        // Check the type of file. We'll use this as the 'post_mime_type'.
        $filetype = wp_check_filetype(basename($filename), null);
        // Prepare an array of post data for the attachment.
        $attachment = array(
            'guid' => dirname($image_url) . '/' . basename($filename),
            'post_mime_type' => $filetype['type'],
            'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
            'post_content' => '',
            'post_status' => 'inherit'
        );
        // Insert the attachment.
        $attach_id = wp_insert_attachment($attachment, $filename);
        // Make sure that this file is included, as wp_generate_attachment_metadata() depends on it.
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        // Generate the metadata for the attachment, and update the database record.
        $attach_data = wp_generate_attachment_metadata($attach_id, $filename);
        wp_update_attachment_metadata($attach_id, $attach_data);
        // extracting data from the button
        echo $image_url . '|' . $image_path . '|' . $new_image_url . '|' . $new_image_path;
    } else {
        $filetype = wp_check_filetype(basename($image_path), null);
        $wp_postname = $wpdb->prefix.'posts';
//        $query = 'UPDATE `wp_posts` SET `guid` = "' . $image_url . '?t=4" WHERE guid = "' . $image_url . '";';
//        $wpdb->query($query);
        $query = 'SELECT ID FROM '.$wp_postname.' WHERE post_mime_type = "' . $filetype['type'] . '" AND (guid ="' . $image_url . '" OR post_content like "%' . $imageURL . '%")';
        $rows = $wpdb->get_results($query);
        if (!empty($rows)) {
            foreach ($rows as $name => $value) {
                $ID = $value->ID;
            }
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            file_put_contents($image_path, base64_decode($image[1]));
            $metadata = wp_generate_attachment_metadata($ID, $image_path);
            $wp_tableName = $wpdb->prefix.'fv_DigiWidgetsData';
            $modified = intval($wpdb->get_var( "SELECT modified FROM $wp_tableName WHERE pictureID = $ID")) + 1;
            $wpdb->query( "UPDATE $wp_tableName SET modified = $modified WHERE pictureID = $ID" );
            $temp = explode('?t=', $metadata['file']);
            $metadata['file'] = $temp[0] . "?t=$modified";
            foreach($metadata['sizes'] as $key => $value) {
                $temp = explode('?t=', $metadata['sizes'][$key]['file']);
                $metadata['sizes'][$key]['file'] = $temp[0] . "?t=$modified";
            }
            wp_update_attachment_metadata($ID, $metadata);
        }
        echo $image_url . '|' . $image_path;
    }
}
?>