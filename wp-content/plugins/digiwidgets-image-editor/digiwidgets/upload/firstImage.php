<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
include_once ABSPATH . 'wp-admin/includes/media.php';
include_once ABSPATH . 'wp-admin/includes/file.php';
include_once ABSPATH . 'wp-admin/includes/image.php';
// Quick sanitization and also length check
$image_title = substr(sanitize_file_name($_REQUEST['imageTitle']), 0, 140);
if (strlen($image_title) === 0) {
    $image_title = "blank";
}
$imageURL = esc_url($_REQUEST['file']);
$firstImage = ($_REQUEST['firstImage'] === 'true');
$table_name = "DigiWidgetsData";
$table_name = $wpdb->prefix . "fv_" . $table_name;
$wp_postname = $wpdb->prefix.'posts';
$query = 'SELECT ID FROM '.$wp_postname.' WHERE guid ="'.$imageURL.'"';
$rows = $wpdb->get_results($query);
if (!empty($rows)) {
    foreach ($rows as $name => $value) {
        $ID = $value->ID;
    }

    $query = 'SELECT pictureID FROM ' . $table_name . ' WHERE pictureID ="' . $ID . '"';
    $rows = $wpdb->get_results($query);
    if (empty($rows)) {

        $upload_dir = wp_upload_dir();

        //Create new image file
        $imageURL = explode('/', $imageURL);
        $imageURL = end($imageURL);
        $image_path = get_attached_file($ID);
        $image_url = esc_url($_REQUEST['file']);

        $dir = plugin_dir_path( __FILE__ );
        $url = plugin_dir_url(__FILE__ );

        $image_extension = "." . pathinfo($image_path, PATHINFO_EXTENSION);
        $base_path = $upload_dir['basedir'] . '/digiwidgets-temp/' . $image_title;
        $base_url = $upload_dir['baseurl'] . '/digiwidgets-temp/' . $image_title;
        $new_image_path = $base_path . $image_extension;
        $new_image_url = $base_url . $image_extension;
        $i = 1;
        while (file_exists($new_image_path)) {
            $new_image_path = $base_path . "($i)" . $image_extension;
            $new_image_url = $base_url . "($i)" . $image_extension;
            $i++;
        }
        copy($image_path, $new_image_path);
        if (file_exists($new_image_path)) {

            echo $new_image_url;
        } else {
            echo 'false';
        }
    } else {
        echo 'false';
    }
}
else {
    echo $imageURL;
}
?>