<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$table_name = "DigiWidgetsData";
$table_name = $wpdb->prefix . "fv_" . $table_name;
$query = "SELECT projectTitle, pictureID, guid, modified FROM $table_name INNER JOIN {$wpdb->posts} ON pictureID=ID ORDER BY pictureID DESC";
$results = $wpdb->get_results($query);
foreach ($results as $row) {
    echo 'ImageFunctions.model().addProject({title: "' . $row->projectTitle .
        '", guid: "' . $row->guid . '"});';
}

