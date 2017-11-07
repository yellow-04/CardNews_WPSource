<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
//Our class extends the WP_List_Table class, so we need to make sure that it's there
if(!class_exists('WP_List_Table')){
    require_once( ABSPATH . 'wp-admin/includes/class-wp-list-table.php' );
}
global $wpdb;
$table_name = "DigiWidgetsData";
$table_name = $wpdb->prefix . "fv_" . $table_name;
//Call database and gather all templates
if (!empty($_GET["action"]) && !empty($_GET["template_id"])) {
    if( $_GET["action"] == "delete" ) {
        $wpdb->delete( $table_name, array( 'templateID' => $_GET["template_id"]));
    }
}


class Links_List_Table extends WP_List_Table {
    /**
     * Constructor, we override the parent to pass our own arguments
     * We usually focus on three parameters: singular and plural labels, as well as whether the class supports AJAX.
     */
    function __construct() {
        parent::__construct( array(
            'singular'=> 'wp_list_text_link', //Singular label
            'plural' => 'wp_list_test_links', //plural label, also this well be one of the table css class
            'ajax'  => true, //We won't support Ajax for this table
            'screen' => 'null'
        ) );
    }

    /**
     * Add extra markup in the toolbars before or after the list
     * @param string $which, helps you decide if you add the markup after (bottom) or before (top) the list
     */
    function extra_tablenav( $which ) {
        if ( $which == "top" ){
            //The code that goes before the table is here
            echo '<div class="wrap">
                <h2 style="display: inline-flex;">DigiWidgets Projects
                    <div id="newProject" onclick="projectMenuFunctions.clickNewProject()" style="width: 84px; margin-left: 20px;" class="add-new-h2">Add New</div>
                </h2></div>';
        }
        if ( $which == "bottom" ){
            //The code that goes after the table is there
        }
    }

    /**
     * Define the columns that are going to be used in the table
     * @return array $columns, the array of columns to use with the table
     */
    function get_columns() {
        return $columns= array(
            'col_project_thumbnail'=>__('Image'),
            'col_project_title'=>__('Title'),
            'col_project_delete'=>__('')
        );
    }

    /**
     * Decide which columns to activate the sorting functionality on
     * @return array $sortable, the array of columns that can be sorted by the user
     */
    public function get_sortable_columns() {
        return $sortable = array(
        );
    }

    /**
     * Prepare the table with different parameters, pagination, columns and table elements
     */
    function prepare_items() {
        global $wpdb;
        $screen = get_current_screen();
        /* -- Preparing your query -- */
        $table_name = "DigiWidgetsData";
        $table_name = $wpdb->prefix . "fv_" . $table_name;
        $query = "SELECT projectTitle, pictureID, guid, modified FROM $table_name INNER JOIN {$wpdb->posts} ON pictureID=ID ORDER BY pictureID DESC";

        /* -- Ordering parameters -- */
        //Parameters that are going to be used to order the result
        $orderby = !empty($_GET["orderby"]) ? esc_sql($_GET["orderby"]) : 'ASC';
        $order = !empty($_GET["order"]) ? esc_sql($_GET["order"]) : '';
        if(!empty($orderby) & !empty($order)){ $query.=' ORDER BY '.$orderby.' '.$order; }
        /* -- Pagination parameters -- */
        //Number of elements in your table?
        $totalitems = $wpdb->query($query); //return the total number of affected rows
        //How many to display per page?
        $perpage = 100;
        //Which page is this?
        $paged = !empty($_GET["paged"]) ? esc_sql($_GET["paged"]) : '';
        //Page Number
        if(empty($paged) || !is_numeric($paged) || $paged<=0 ){ $paged=1; }
        //How many pages do we have in total?
        $totalpages = ceil($totalitems/$perpage);
        if($totalpages == 0){
            $totalpages = 1;
        }
        //adjust the query to take pagination into account
        if(!empty($paged) && !empty($perpage)){
            $offset=($paged-1)*$perpage;
            $query.=' LIMIT '.(int)$offset.','.(int)$perpage;
        }

        /* -- Register the pagination -- */
        $this->set_pagination_args( array(
            "total_items" => $totalitems,
            "total_pages" => $totalpages,
            "per_page" => $perpage,
        ) );
        //The pagination links are automatically built according to those parameters

        /* — Register the Columns — */
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = array();
        $this->_column_headers = array($columns, $hidden, $sortable);

        /* -- Fetch the items -- */
        $this->items = $wpdb->get_results($query);
    }

    /**
     * Display the rows of records in the table
     * @return string, echo the markup of the rows
     */
    function display_rows() {
        //Get the records registered in the prepare_items method
        $records = $this->items;

        //Get the columns registered in the get_columns and get_sortable_columns methods
        list( $columns, $hidden ) = $this->get_column_info();

        //Loop for each record
        if(!empty($records)){foreach($records as $rec){
            //Open the line
            $selectCommand = "projectMenuFunctions.getEditor('".$rec->guid."')";
            echo '<tr class="recordTable" id="record_'.$rec->pictureID.'" onclick="'.$selectCommand.'">';
            foreach ( $columns as $column_name => $column_display_name ) {
                //Style attributes for each col
                $class = "class='$column_name column-$column_name'";
                $style = "style='vertical-align:middle !important;'";
                if ( in_array( $column_name, $hidden ) ) $style = ' style="display:none;"';
                $attributes = $class . $style;
                $size = wp_get_attachment_image_src($rec->pictureID, 'full');
                $widthRatio = 97 / $size[1];
                $lengthRatio = 60 / $size[2];

                if ($size[1] <= 97 && $size[2] <= 60) {
                    $thumbnailWidth = $size[1];
                    $thumbnailHeight = $size[2];
                }
                else {
                    if ($widthRatio <= $lengthRatio) {
                        $thumbnailWidth = $size[1] * $widthRatio;
                        $thumbnailHeight = $size[2] * $widthRatio;
                    }
                    else {
                        $thumbnailWidth = $size[1] * $lengthRatio;
                        $thumbnailHeight = $size[2] * $lengthRatio;
                    }
                }
                //Display the cell
                switch ( $column_name ) {
                    case "col_project_thumbnail":     echo '<td '.$attributes.'><div style="width:97px; height:60px; text-align: center;"><img src="'.$rec->guid.'?t=' .$rec->modified.'" width="'.$thumbnailWidth.'" height="'.$thumbnailHeight.'"></div></td>'; break;
                    case "col_project_title": echo '<td '.$attributes.'>'.htmlspecialchars(stripslashes($rec->projectTitle)).'</td>'; break;
                    case "col_project_delete": echo "<td><div onclick='var event = arguments[0] || window.event; event.stopPropagation(); projectMenuFunctions.deleteExistingProject(\"$rec->pictureID\")' title='Delete' class='dashicons dashicons-trash closeProject'></div><div onclick='var event = arguments[0] || window.event; event.stopPropagation(); projectMenuFunctions.clickDuplicateProject(\"$rec->guid\")' title='Duplicate' class='dashicons dashicons-format-gallery closeProject' style='margin-left: 25px;'></div></td>";
                }
            }
            //Close the line
            echo'</tr>';
        }}

        // Blocks event propagation of the selectExistingProject when clicking the deleteproject option
        //echo '<script>$(".recordTable .closeProject").click(function(e) {e.stopPropagation();})</script>';
    }
}

//Prepare Table of elements
$wp_list_table = new Links_List_Table();
$wp_list_table->prepare_items();

//Table of elements
$wp_list_table->display();
?>