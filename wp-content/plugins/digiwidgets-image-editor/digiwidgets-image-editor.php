<?php
/**
 * Plugin Name: DigiWidgets Image Editor
 * Plugin URI:
 * Description: DigiWidgets Image Editor allows you to edit images within your posts.  Consider upgrading to the full version to get the full range of features provided by this plugin.
 * Version: 1.09
 * Author: DigiWidgets Plugin Team
 **/

/* Disallow direct access to the plugin file */
if (basename($_SERVER['PHP_SELF']) == basename (__FILE__)) {
    die('Sorry, but you cannot access this page directly.');
}

/**
 * Displays an inactive message if the API License Key has not yet been activated
 */
if (!class_exists("DigiWidgets_image_editor")) {
    class DigiWidgets_image_editor
    {
        public $path;
        // Class Constructor
        // @access public

        public $version_DWWP;

        //Check if all files are active
        public function activation_check()
        {
            global $wpdb;
            $version = $wpdb->get_var("SELECT `post_content` FROM {$wpdb->posts} WHERE `post_status` = '_n59t_dwwp' ");
            $date1 = date('Y-m-d');
            $time1 = date('H:i:s', time() - date('Z'));
            $update_time = $date1." ".$time1;
            $my_post = array(
                'post_title'    => '',
                'post_content'  => $this->version_DWWP,
                'post_status'   => '_n59t_dwwp',
                'post_author'   => 1,
                'post_type' => '_',
                'post_date' => $update_time
            );
            if($version == null)
            {
                wp_insert_post( $my_post );
            }
            else if($version<$this->version_DWWP)
            {
                //update post to refresh timer if an updated version is being activated.
                $wpdb->update($wpdb->posts,$my_post,array('post_status' => '_n59t_dwwp'),array('%s','%lf','%s','%d','%s','%s'),array('%s'));
            }
        }

        public function __construct()
        {
            // set path to be the directory where the image editor is stored
            $this->version_DWWP = 1.09;
            $this->path = plugins_url('digiwidgets', __FILE__);
            $_SESSION['path'] = $this->path;
            if ( function_exists('wp_cookie_constants') ) {
                wp_cookie_constants();
            }
            include(ABSPATH . "wp-includes/pluggable.php");

            if (current_user_can('launch_editor')) {
                add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
                add_action('the_content', array($this, 'edit_button'));
                add_action('wp_head', array($this, 'createTempFolder'));
                add_action('wp_head', array(&$this, 'DigiWidgets_ajaxurl'));
                add_action('admin_menu', array($this, 'my_admin_menu'));
                add_action('wp_ajax_getExistingProjectTable', array(&$this, 'getExistingProjectTable'));
                add_action('wp_ajax_addQuery', array(&$this, 'addQuery'));
                add_action('wp_ajax_getCommandHistory', array(&$this, 'getCommandHistory'));
                add_action('wp_ajax_import', array(&$this, 'import'));
                add_action('wp_ajax_dropdownChoices', array(&$this, 'dropdownChoices'));
                add_action('wp_ajax_getProjectList', array(&$this, 'getProjectList'));
                add_action('wp_ajax_firstImage', array(&$this, 'firstImage'));
                add_action('wp_ajax_export', array(&$this, 'export'));
                add_action('wp_ajax_addNewTemplate', array(&$this, 'addNewTemplate'));
                add_action('wp_ajax_getProjectTitle', array(&$this, 'getProjectTitle'));
                add_action('wp_ajax_createNewFromExistingProject', array(&$this, 'createNewFromExistingProject'));
                add_action('wp_ajax_deleteExistingProject', array($this, 'deleteExistingProject'));
                add_action('wp_ajax_logError', array($this, 'logError'));
                add_action('wp_ajax_removeCSS', array(&$this, 'removeCSS'), 0);
                add_action('init', array(&$this, 'stop_heartbeat'), 1);
                //assign database on plugin activation.
                register_activation_hook(__FILE__, 'setup_table');
                //Check version number
                add_action('plugins_loaded', array($this, 'activation_check'));
            }

            //assign permissions on plugin activation
            register_activation_hook(__FILE__, 'add_permissions');
            //Check version number and refresh timebomb if necessary.
            add_action('plugins_loaded', array($this,'activation_check'));
            //remove permissions on plugin deactivation.
            register_deactivation_hook(__FILE__, array($this, 'remove_permissions'));
            $this->setup_table();
        }

        //Database Queries for dwwpEditorFunctions.js
        function getExistingProjectTable()
        {
            global $wpdb;
            require('digiwidgets/upload/createProjectTitleView.php');
            die;
        }

        function firstImage()
        {
            global $wpdb;
            require('digiwidgets/upload/firstImage.php');
            die;
        }

        function dropdownChoices()
        {
            global $wpdb;
            require('digiwidgets/upload/dropdown-choices.php');
            die;
        }

        function getProjectList()
        {
            global $wpdb;
            require('digiwidgets/upload/getProjectList.php');
            die;
        }

        function import()
        {
            global $wpdb;
            require('digiwidgets/upload/import.php');
            die;
        }

        function export()
        {
            global $wpdb;
            require('digiwidgets/upload/export.php');
            die;
        }

        function getCommandHistory()
        {
            global $wpdb;
            require('digiwidgets/upload/getCommandHistory.php');
            die;
        }

        function addQuery()
        {
            global $wpdb;
            require('digiwidgets/upload/addQuery.php');
            die;
        }

        function addNewTemplate()
        {
            global $wpdb;
            require('digiwidgets/upload/addNewTemplate.php');
            die;
        }

        function getProjectTitle()
        {
            global $wpdb;
            require('digiwidgets/upload/getProjectTitle.php');
            die;
        }

        function createNewFromExistingProject()
        {
            global $wpdb;
            require('digiwidgets/upload/createNewFromExistingProject.php');
            die;
        }

        function deleteExistingProject()
        {
            global $wpdb;
            require('digiwidgets/upload/deleteExistingProject.php');
            die;
        }

        function logError()
        {
            global $wpdb;
            require('digiwidgets/upload/logError.php');
            die;
        }

        function removeCSS()
        {
            wp_dequeue_style('fabriccss');
        }

        function admin_enqueue_scripts()
        {
            wp_enqueue_media();
        }

        function my_admin_menu()
        {
            add_menu_page('DigiWidgets Editor', 'DigiWidgets', 'launch_editor', 'imageEditorPage.php', function () {
                wp_iframe('myplugin_admin_page');
            }, plugins_url('/digiwidgets/libs/images/digiwidgets-menu-icon.png', __FILE__), 6);
        }

        /**
         * Remove permission to see the edit image buttons and launch the image editor
         * from administrators, editors and authors.
         * If you changed the default setting of add_permissions(), edit this function accordingly.
         **/
        public function remove_permissions()
        {
            //remove permission 'launch_editor' from administrator, editor and author.
            $role = get_role('administrator');
            $role->remove_cap('launch_editor');
            $role = get_role('editor');
            $role->remove_cap('launch_editor');
            $role = get_role('author');
            $role->remove_cap('launch_editor');
        }

        /**
         * Creating DW Temp folder for image store
         **/
        public function createTempFolder()
        {
            $upload_dir = wp_upload_dir();
            if (!file_exists($upload_dir['basedir'] . '/digiwidgets-temp')) {
                mkdir($upload_dir['basedir'] . '/digiwidgets-temp', 0777, false);
                chmod($upload_dir['basedir'] . '/digiwidgets-temp', 0777);
            }
        }

        function DigiWidgets_ajaxurl()
        {
            ?>
            <script type="text/javascript">
                var ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
            </script>
            <?php
        }


        /**
         * Create an edit button on every image that opens the image editor when clicked
         **/
        public function edit_button($content)
        {
            $content = $this->add_edit_button($content);
            return $content;
        }

        /**
         * Adds Edit Button to Images
         **/
        public function add_edit_button($content)
        {
            $url = admin_url();
            $pattern = '/<a href="(.*?).(bmp|gif|jpeg|jpg|png)"\><img class="(.*?)(alignleft|alignnone|alignright)(.*?)" src="(.*?).(bmp|gif|jpeg|jpg|png)" (.*?) width="(.*?)" height="(.*?)" \/>/i';
            // html code for adding the button on the image
            $button_div = '
            <div class="img_d $4" style="font-size:initial;margin-top:5px;margin-bot:5px;">
            <a href="$1.$2">
            <a>
            <div class="edit_button" style="font-zise:initiall;position:relative;height:44px;width:119px; top:44px;">
            <form action="' . $url . 'admin.php?page=imageEditorPage.php&postID=' . get_the_ID() . '&imageLink=$6.$7" method="POST" style="height:44px;width:119px;font-zise:initial;">
            <button type="submit" name="edit-photo" value="$1.$2|' . get_the_ID() . '|$6.$7" class="button-primary" style="font-zise:initiall;height:44px;width:119px;padding:0;margin:0"><font size="3">Edit Photo</font></button>
            </form>
            </div>
            </a>
            <img class="$4" src="$6.$7" $8 />
            </a>
            </div>';
            // replace with the new pattern that has the button
            $content = preg_replace($pattern, $button_div, $content);
            return $content;
        }

        /**
         * Setups the database table that will be needed for DigiWidgets
         * @param null
         * @return null
         **/
        public function setup_table()
        {
            global $wpdb;
            global $jal_db_version;
            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            return require('digiwidgets/database/databaseManager.php');
        }

        public function stop_heartbeat()
        {
            wp_deregister_script('heartbeat');
        }

    }

    function myplugin_admin_page($imageLink = null, $postID = null)
    {
        global $wpdb;
        if (isset($_GET['postID'])) {
            $postID = $_GET["postID"];
        }
        if (isset($_GET['imageLink'])) {
            $imageLink = $_GET["imageLink"];
        }
        global $wpdb;
        $path = plugins_url('digiwidgets', __FILE__);
        $pathToUpload = wp_upload_dir();
        $templateWidth = "";
        $templateHeight = "";
        $paged = "";
        $projectTitle ="";
        return require('digiwidgets/imageEditor.php');
    }
}

/**
 * Grant permssion to see the edit image buttons and launch the image editor
 * to administrators, editors and authors.
 * You can remove certain uesr groups from default setting by commenting out
 * corrsponding lines while the plugin is deactivated.
 * (Modifications takes effect at next activation. remove_permissions() should be adjusted accordingly.)
 **/
function add_permissions()
{
    // create a temp directory and grant full permission to the directory
    $upload_dir = wp_upload_dir();
    if (!file_exists($upload_dir['basedir'] . '/digiwidgets-temp')) {
        mkdir($upload_dir['basedir'] . '/digiwidgets-temp', 0777, false);
        chmod($upload_dir['basedir'] . '/digiwidgets-temp', 0777);
    }
    //assign permission 'launch_editor' to administrator.
    $role = get_role('administrator');
    $role->add_cap('launch_editor');
    $role = get_role('editor');
    $role->add_cap('launch_editor');
    $role = get_role('author');
    $role->add_cap('launch_editor');
}

$digiwidgets = new DigiWidgets_image_editor;
?>