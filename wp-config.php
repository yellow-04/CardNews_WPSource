<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME','wordpress');

/** MySQL database username */
define('DB_USER','wordpress_user');

/** MySQL database password */
define('DB_PASSWORD','kamilake1234');

/** MySQL hostname */
define('DB_HOST', 'localhost:/run/mysqld/mysqld10.sock');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY','6Qw+3phX2TTYW+brJ4dpc7HyvbaGjnBnzfB6lsyphLaMLc5fs1KW80gkgUW7+GUP');
define('SECURE_AUTH_KEY','M/LosSD4OtvOOrOrTLKanCYB3fZUNqV2DSRBGA8oJbpSV9hK4rz5Rz3t5a0VU5uJ');
define('LOGGED_IN_KEY','4tVU2zcWDhvBGHdN+JhLjp8HWWonXXIEqq/Tk0zqL6iv3Uekg+XvW46Y4n+ya1aD');
define('NONCE_KEY','IGfr/+H7ZHhAY/ZqwH0F/LQJoAVuyD382bAKDvw7BMYR2DJnwNCnybifrpvuly1k');
define('AUTH_SALT','p29VMtyAh5lKvYavR7a/GtUFclLk2SFzjkaZLY9kgeuxutW47c1x6WS+9wDkDJHg');
define('SECURE_AUTH_SALT','oMwvbZbn3X85E/G30VbmCUIcoTDjpdF2P65ivkPS7GjLbmeScsYRP7VtZkMMUfAS');
define('LOGGED_IN_SALT','BpL4ed9ZuJnQuvYQUZMEpN6EYeLn3vHXj3n2redCrEtCw1HmMPS2xwGa8YWDrNIq');
define('NONCE_SALT','I/ckmEvOgb/vhtU/oMfhHC3bYRRHzSLnUrXa2SH+X9YUyd0mCIC6x/pwtLddslbd');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 */

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */
$pageURL = 'http';
if ($_SERVER["HTTPS"] == "on") {$pageURL .= "s";}
$pageURL .= "://";
if ($_SERVER["SERVER_PORT"] != "80" and $_SERVER["SERVER_PORT"] != "443") {
	$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"];
} else {
	$pageURL .= $_SERVER["SERVER_NAME"];
}

if ($_SERVER["HOST"] != "") {
	define('WP_SITEURL', $pageURL);
} else {
        define('WP_SITEURL', $pageURL.'/wordpress');
}

if (!defined('SYNOWORDPRESS'))
	define('SYNOWORDPRESS', 'Synology Inc.');

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
require_once(ABSPATH . 'syno-misc.php');

define( 'AUTOMATIC_UPDATER_DISABLED', true );
add_filter('pre_site_transient_update_core','__return_null');
