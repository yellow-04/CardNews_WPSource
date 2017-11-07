<?php
/*
 * Database Manager
 * Used for handling setting up the database and also provide upgrading and downgrading in a modular approach
 */
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
initializeDatabase();
setup_template_table();
updateCheck();

/*
 * Function will check if all the tables exist and if some are missing it will create them. Make sure all tables that
 * are created are the newest versions, and $jal_db_version is set to the newest version.
 */
function initializeDatabase(){
    global $wpdb;
    global $jal_db_version;
    //Newest version of database
    $jal_db_version = '1.1';
    //Creating DigiWidgetsData table if it does not exist
    $table_name = $wpdb->prefix . "fv_DigiWidgetsData";
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE $table_name (
                  pictureID INT NOT NULL,
                  modified INT NOT NULL,
                  json BLOB,
                  commandHistory MEDIUMBLOB,
                  projectTitle varchar(100),
                  UNIQUE KEY id (pictureID)
                ) $charset_collate;";
        dbDelta($sql);
        add_option('digiwidgets_fv_jal_db_version', $jal_db_version);
    }
    //Creating DigiWidgetsTemplates table if it does not exist
    $table_name = $wpdb->prefix . "fv_DigiWidgetsTemplates";
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE $table_name (
                  templateID INT NOT NULL AUTO_INCREMENT,
                  templateTitle VARCHAR(50),
                  canvasWidth int,
                  canvasHeight int,
                  UNIQUE KEY id (templateID)
                ) $charset_collate;";
        dbDelta($sql);
        add_option('digiwidgets_fv_jal_db_version', $jal_db_version);
    }
    //Creating DigiWidgetsLog table if it does not exist
    $table_name = $wpdb->prefix . "fv_DigiWidgetsLog";
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE $table_name (
                      errorID INT NOT NULL AUTO_INCREMENT,
                      error VARCHAR(255),
                      stackTrace TEXT,
                      date INT,
                      UNIQUE KEY id (errorID)
                    ) $charset_collate;";
        dbDelta($sql);
        add_option('digiwidgets_fv_jal_db_version', $jal_db_version);
    }
    //Creating DigiWidgetsLogHistory table if it does not exist
    $table_name = $wpdb->prefix . "fv_DigiWidgetsLogHistory";
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE $table_name (
                      errorTimeID INT NOT NULL AUTO_INCREMENT,
                      errorTime INT,
                      UNIQUE KEY id (errorTimeID)
                    ) $charset_collate;";
        dbDelta($sql);
        add_option('digiwidgets_fv_jal_db_version', $jal_db_version);
    }
}

/*
 * All Updates need to be placed the the database folder. Files need to be named exact. Following the version number of jal_db_version.
 * For example if the jal_db_version is 1.0 and you want to create an update the file would be called "1-1.php". If you want to create
 * a second update the next would be "1-2.php". In the update files you have access to $wpdb to perform any database updates needed.
 */
function updateCheck(){
    global $wpdb;
    global $jal_db_version;
    $installed_ver = get_option( "digiwidgets_fv_jal_db_version" );
    //Upgrading
    if($installed_ver == false) {
        update_option( "digiwidgets_fv_jal_db_version", '1.0' );
        $installed_ver = '1.0';
    }
    if($installed_ver < $jal_db_version ){
        $newVersion = $installed_ver + .1;
        $file = str_replace(".", "-", (string)$newVersion);
        $file = $file.'.php';
        $path = dirname(__FILE__) . '/'.$file;
        while(file_exists($path)){
            require($path);
            update_option( "digiwidgets_fv_jal_db_version", $newVersion );
            $newVersion = $newVersion + .1;
            $file = str_replace(".", "-", (string)$newVersion);
            $file = $file.'.php';
            $path = dirname(__FILE__) . '/'.$file;
        }
    }
}

/*
 * Setting up specified templates in free version
 */
function setup_template_table() {
    global $wpdb;
    $table_nameTemplates = $wpdb->prefix . "fv_DigiWidgetsTemplates";
    $count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_nameTemplates" );
    if ($count == 0) {
        $wpdb->query("DELETE FROM `$table_nameTemplates` WHERE 1=1");
        $wpdb->insert($table_nameTemplates, array('templateId' => 1, 'templateTitle' => "Small Horizontal",
            'canvasWidth' => 300, 'canvasHeight' => 200));
        $wpdb->insert($table_nameTemplates, array('templateId' => 2, 'templateTitle' => "Small Vertical",
            'canvasWidth' => 200, 'canvasHeight' => 300));
        $wpdb->insert($table_nameTemplates, array('templateId' => 3, 'templateTitle' => "Large Horizontal",
            'canvasWidth' => 600, 'canvasHeight' => 400));
        $wpdb->insert($table_nameTemplates, array('templateId' => 4, 'templateTitle' => "Large Vertical",
            'canvasWidth' => 400, 'canvasHeight' => 600));
    }
}