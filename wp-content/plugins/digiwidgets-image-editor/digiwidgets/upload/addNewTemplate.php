<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$templateTitle = sanitize_text_field($_REQUEST['title']);
$templateWidth = intval($_REQUEST['width'], 0);
$templateHeight = intval($_REQUEST['height'], 0);
$tablename = 'DigiWidgetsTemplates';
$tablename = $wpdb->prefix . "fv_" . $tablename;

$wpdb->update($tablename, array(
    'templateTitle' => $templateTitle, 'canvasWidth' => $templateWidth, 'canvasHeight' => $templateHeight),
    array( 'templateID' => 5 ), array( '%s', '%d', '%d' ), array ('%d' ));

echo $templateTitle;
?>