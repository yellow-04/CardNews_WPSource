<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$url = esc_url($_REQUEST['file']);
$file = explode("/", $url);
$uploadURL = esc_url($_REQUEST['upload']);
$image_path = $uploadURL . '/' . end($file);
echo file_put_contents($image_path, file_get_contents($url));
?>
