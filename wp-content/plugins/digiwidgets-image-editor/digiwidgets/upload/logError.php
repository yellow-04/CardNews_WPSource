<?php
/**
 * Created by PhpStorm.
 * User: bfenwick
 * Date: 1/26/2016
 * Time: 2:27 PM
 */
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$error = sanitize_text_field($_REQUEST['error']);
$stack_trace = sanitize_text_field($_REQUEST['stackTrace']);
$send_log = ($_REQUEST['sendLog'] === 'true');
$get_logs = ($_REQUEST['getLogs'] === 'true');
$table_name = $wpdb->prefix. "fv_" . 'DigiWidgetsLog';
$time = time();
$wpdb->insert($table_name, array('error' => $error, 'stackTrace' => $stack_trace, 'date' => $time));
// Manual Logging
if($get_logs){
    $data = $wpdb->get_results( "SELECT stackTrace FROM $table_name WHERE 1=1");
    $array = json_decode(json_encode($data), true);

    $temp = array();
    foreach ($array as $elem) {
        $temp[] = implode("\n", $elem);
    }
    $temp = array_reverse($temp);
    echo date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']) . "\n" . implode("\n", $temp);
}

if ($send_log) {

    // Just dump the whole table into the email
    $data = $wpdb->get_results( "SELECT stackTrace FROM $table_name WHERE 1=1");
    $array = json_decode(json_encode($data), true);

    $temp = array();
    foreach ($array as $elem) {
        $temp[] = implode("\n", $elem);
    }
    $temp = array_reverse($temp);

    wp_mail( 'dev@digiwidgets.com', "DigiWidgets Image Editor FV Error on " . $_SERVER["SERVER_NAME"],
        date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']) . "\n" . implode("\n", $temp) );
    // Wipe the current log
    $wpdb->query( "DELETE FROM `$table_name` WHERE 1=1" );
    $log_count = 0;
}
?>