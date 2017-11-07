<?php
/**
 * Created by PhpStorm.
 * User: bfenwick
 * Date: 1/14/2016
 * Time: 12:38 PM
 * Deletes a project from the database based on the given id
 */
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$image_id = intval($_REQUEST['image_id']);
$tablename = 'DigiWidgetsData';
$tablename = $wpdb->prefix . "fv_" . $tablename;
echo ($wpdb->get_var( "SELECT guid FROM {$wpdb->posts} WHERE ID = $image_id" ));
$wpdb->delete( $tablename, array( 'pictureID' => $image_id ) );
?>