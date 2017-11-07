<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$table_name = 'DigiWidgetsTemplates';
$table_name = $wpdb->prefix . "fv_" . $table_name;
$query = 'SELECT * FROM '.$table_name;
$results = $wpdb->get_results($query);
foreach ($results as $row) {
    echo '<option value="' . htmlspecialchars($row->canvasWidth) . ',' . htmlspecialchars($row->canvasHeight) . ',' .
        htmlspecialchars($row->templateTitle) . '">' . htmlspecialchars($row->templateTitle) ."   (".htmlspecialchars($row->canvasWidth)."x".htmlspecialchars($row->canvasHeight).')</option>';
}
?>