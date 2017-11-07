<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$imageURL = esc_url($_REQUEST['file']);
$tablename = 'posts';
$tablename = $wpdb->prefix . $tablename;
$query = "SELECT ID FROM ".$tablename." WHERE guid='$imageURL'";
$id = $wpdb->get_var($query);

if($id){
    $tablename = 'DigiWidgetsData';
    $tablename = $wpdb->prefix . "fv_" . $tablename;
    $query = "SELECT projectTitle FROM ".$tablename." WHERE pictureID=".$id;
    $title = $wpdb->get_var($query);
    echo stripslashes($title);
} else {
    echo "Wrong Picture";
}
?>