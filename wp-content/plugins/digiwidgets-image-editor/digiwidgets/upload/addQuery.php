<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$url = esc_url($_REQUEST['file']);
$json = json_encode(json_decode(
    preg_replace("/\\\\'/", "'", preg_replace('/\\\\"/', '"', $_REQUEST['jsonInfo']))));
$commandHistory = $_REQUEST['commandHistory'];
$commandHistory = json_encode(json_decode(
    preg_replace("/\\\\'/", "'", preg_replace('/\\\\"/', '"', $commandHistory))));
$action = $_REQUEST['queryAction'];
$table_name = "DigiWidgetsData";
$table_name = $wpdb->prefix . "fv_" . $table_name;
$wp_postname = $wpdb->prefix.'posts';
$query = 'SELECT ID FROM '.$wp_postname.' WHERE guid ="' . $url . '"';
$rows = $wpdb->get_results($query);
if (!empty($rows)) {
    foreach ($rows as $name => $value) {
        $ID = $value->ID;
    }
    $query = "SELECT json FROM $table_name WHERE pictureID = $ID ";
    $rows = $wpdb->get_results($query);
    if (empty($rows)) {
        $projectTitle = sanitize_text_field($_REQUEST['projectTitle']);
        $wpdb->insert($table_name, array('pictureID' => $ID, 'json' => $json,'projectTitle' => $projectTitle));
        echo $json;
    } else {
        if ($action != "update") {
            foreach ($rows as $name => $value) {
                echo $value->json;
            }
        } else {
            $projectTitle = sanitize_text_field($_REQUEST['projectTitle']);
            $wpdb->update(
                $table_name,
                array('json' => $json, 'commandHistory' => $commandHistory, 'projectTitle' => $projectTitle),
                array('pictureID' => $ID)
            );
            echo $json;
        }
    }
}