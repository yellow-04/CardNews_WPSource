<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$imageURL = esc_url($_REQUEST['url']);
$title = substr(sanitize_file_name($_REQUEST['title']), 0, 140);
if (strlen($title) === 0) {
    $title = "blank";
}
$projectTitle = sanitize_text_field($_REQUEST['title']);
$tablename = 'posts';
$tablename = $wpdb->prefix . $tablename;
$query = "SELECT ID FROM ".$tablename." WHERE guid='$imageURL'";
$id = $wpdb->get_var($query);

$tablename = 'DigiWidgetsData';
$tablename = $wpdb->prefix . "fv_" . $tablename;
$query = "SELECT * FROM ".$tablename." WHERE pictureID=".$id;
$rows = $wpdb->get_results($query);
if (!empty($rows)) {
    foreach ($rows as $name => $value) {
        $id = $value->pictureID;
        $json = $value->json;
        $commandHistory = $value->commandHistory;
    }

// This means that the image is from an existing project so we have to return a brand new image
    //First Create a new image based off the old one
    $imageName = explode('/', $imageURL);
    $imageName = end($imageName);
    $image_path = get_attached_file($id);
    // check if file with same name exists in upload path, rename file
    $new_image_path = $image_path;
    $originalImage = $image_path;
    $dir = plugin_dir_path( __FILE__ );
    $url = plugin_dir_url(__FILE__ );
    $originalImageArray = explode('.', $imageName);

    $base_path = dirname($image_path) . '/' . $title;
    $image_extension = '.' . pathinfo($originalImage, PATHINFO_EXTENSION);
    $originalImage = $base_path . $image_extension;
    $i = 1;
    while (file_exists($originalImage)) {
        $originalImage = urldecode($base_path . "($i)" . $image_extension);
        $i++;
    }
    copy($image_path, $originalImage);
    $filename = $originalImage;
    // Check the type of file. We'll use this as the 'post_mime_type'.
    $filetype = wp_check_filetype(basename($filename), null);
    // Prepare an array of post data for the attachment.
    $attachment = array(
        'guid' => dirname($imageURL) . '/' . basename($filename),
        'post_mime_type' => $filetype['type'],
        'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
        'post_content' => '',
        'post_status' => 'inherit'
    );
    // Insert the attachment.
    $newImage_id = wp_insert_attachment($attachment, $filename, '0');
    // Make sure that this file is included, as wp_generate_attachment_metadata() depends on it.
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    // Generate the metadata for the attachment, and update the database record.
    $attach_data = wp_generate_attachment_metadata($newImage_id, $filename);
    wp_update_attachment_metadata($newImage_id, $attach_data);

    //Second Create a record of the new image into DigiWidgets Data and copy the JSON from the old image into the new image
    $wpdb->insert($tablename, array('pictureID' => $newImage_id, 'json' => $json,'commandHistory' => $commandHistory, 'projectTitle' => $projectTitle));

    //Third echo new image URL
    echo dirname($imageURL) . '/' . basename($filename);
} else {
    // The image is brand new and we add it into the database and return that link

    $image_extension = "." . pathinfo($imageURL, PATHINFO_EXTENSION);
    $pathArray = wp_upload_dir();
    $base_path = $pathArray['path'] . '/';
    $i = 1;
    $filename = $base_path . $title . $image_extension;

    while (file_exists($filename)) {
        $filename = $base_path . $title . "($i)" . $image_extension;
        $i++;
    }
    copy($imageURL, $filename);

    // Check the type of file. We'll use this as the 'post_mime_type'.
    $file_type = wp_check_filetype(basename($filename), null);
    // Prepare an array of post data for the attachment.
    $attachment = array(
        'guid' => $pathArray['url'] . '/' . basename($filename),
        'post_mime_type' => $file_type['type'],
        'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
        'post_content' => '',
        'post_status' => 'inherit'
    );

    // Insert the attachment.
    $attach_id = wp_insert_attachment($attachment, $filename, '0');
    // Make sure that this file is included, as wp_generate_attachment_metadata() depends on it.
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    // Generate the metadata for the attachment, and update the database record.
    $attach_data = wp_generate_attachment_metadata($attach_id, $filename);
    wp_update_attachment_metadata($attach_id, $attach_data);

    echo $attachment['guid'];

}
?>