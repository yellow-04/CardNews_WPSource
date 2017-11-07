<?php
/**
 * Created by PhpStorm.
 * Date: 3/15/2016
 * Time: 3:33 PM
 */
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$table_name = $wpdb->prefix . "fv_" . "DigiWidgetsData";
$wpdb->query("ALTER TABLE $table_name ADD modified INT NOT NULL");