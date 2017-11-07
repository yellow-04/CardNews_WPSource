<?php
class csSYNOWordPressMisc {

	static function get_home_path($home, $siteurl) {

		$root_dir = '/var/services/web';
		if ( $home != '' && $home != $siteurl ) {
			$home_path = $root_dir . "/wordpress/";
		} else {
			$home_path = ABSPATH;
		}

		return $home_path;
	}
}
?>
