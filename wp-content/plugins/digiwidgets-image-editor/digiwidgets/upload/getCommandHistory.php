<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
include_once ABSPATH . 'wp-admin/includes/media.php';
include_once ABSPATH . 'wp-admin/includes/file.php';
include_once ABSPATH . 'wp-admin/includes/image.php';
$imageURL = esc_url($_REQUEST['file']);
$table_name = "DigiWidgetsData";
$table_name = $wpdb->prefix . "fv_" . $table_name;
$wp_postname = $wpdb->prefix.'posts';
$query = 'SELECT ID FROM '.$wp_postname.' WHERE guid ="'.$imageURL.'"';
$rows = $wpdb->get_results($query);
if (!empty($rows)) {
    foreach ($rows as $name => $value) {
        $ID = $value->ID;
    }
    $query = 'SELECT commandHistory FROM ' . $table_name . ' WHERE pictureID ="' . $ID . '"';
    $rows = $wpdb->get_results($query);
    if (!empty($rows)) {
        foreach ($rows as $name => $value) {
            $commandHistory = $value->commandHistory;
        }
        if ($commandHistory != null){
            echo $commandHistory;
        }
        else {
            echo 'false';
        }

    }
    else{
        echo 'false';
    }
}
else {
    echo 'false';
}