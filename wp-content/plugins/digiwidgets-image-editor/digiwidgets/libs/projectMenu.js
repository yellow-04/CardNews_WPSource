/* global jQuery, wp, DWWPSettings, window, Mousetrap, Canvas2Image, fabric, ajaxurl */
window.projectMenuFunctions = (function ($) {
    $('#thankYouAd').hide();
    $('#fade2').hide();
    var existingHeight = $('#wpwrap').height();
    $("#fade").css('height', existingHeight + 'px');
    $('#fade').show();
    'use strict';
    var self = {};
    var existingProjectContainer = document.getElementById("existingProjectContainer");
    existingProjectContainer.style.visibility = 'visible';
    var data = {
        'action': 'getExistingProjectTable'
    };

    $(window).bind('beforeunload', function(){
        var existingHeight = $('#wpwrap').height();
        $("#fade").css('height', existingHeight + 'px');
        $('#fade').show();
        $('#loading-image').show();
    });

    $('#maincontent').ajaxStart(function(){
        var existingHeight = $('#wpwrap').height();
        $("#fade").css('height', existingHeight + 'px');
        $('#fade').show();
        $('#loading-image').show();
    });
    $('#maincontent').ajaxStop(function(){
        $('#fade').hide();
    });

    // ajaxurl is loaded from digiwidgets-image-editor.php
    $.post(ajaxurl, data, function (data) {
        $('#existingProjectContainer').append(data);
        $('#existingProjectContainer').css('height', 'auto');
        var existingContainerHeight = $('#existingProjectContainer').height();
        $('#existingProjectContainer').css('height', '100vh');
        $('#wpfooter').css('position', 'relative');
        $('#wpfooter').css('margin-top', existingContainerHeight + 'px');
    });

    var data1 = {
        'action': 'dropdownChoices'
    };
    $.post(ajaxurl, data1, function(data) {
        $('#templateDropdownNewProject').append(data);
        $('#templateDropdownDuplicateProject').append(data);
        $('#templateDropdown').append(data);
        $('#templateDropdownNewProject').append('<option value="0,0,Add New Template">New Size</option>');
        $('#templateDropdownDuplicateProject').append('<option value="0,0,Add New Template">New Size</option>');
        var addNew = $("#templateDropdown option[value='0,0,Add New Template']");
        if (addNew.length > 0) {
            $(addNew[0]).remove();
        }
    });

    self.clickNewProject = function () {
        var existingHeight = $('#existingProjectContainer').height();
        $("#fade").css('height', existingHeight + 'px');
        $("#fade").show();
        $('#loading-image').hide();
        var newProjectContainer = document.getElementById("newProjectContainer");
        newProjectContainer.style.visibility = 'visible';
        $('#templateDropdown').prop('disabled', false).removeClass('disabled');
    };

    self.closeAd = function () {
        $("#fade2").hide();
        $("#thankYouAd").hide();
    };

    self.clickDuplicateProject = function (guid) {
        var existingHeight = $('#existingProjectContainer').height();
        $("#fade").css('height', existingHeight + 'px');
        $("#fade").show();
        $('#loading-image').hide();
        var newProjectContainer = document.getElementById("duplicateProjectContainer");
        newProjectContainer.style.visibility = 'visible';
        $('#templateDropdown').prop('disabled', false).removeClass('disabled');
        $('input[name="imageLink"]').val(guid);
    };

    self.cancelNewProject = function() {
        $("#fade").hide();
        $('#loading-image').show();
        var newProjectContainer = document.getElementById("newProjectContainer");
        newProjectContainer.style.visibility = 'hidden';
        newProjectContainer = document.getElementById("duplicateProjectContainer");
        newProjectContainer.style.visibility = 'hidden';
    };

    /**
     * Delete a currently existing project of the users.  Will quietly do nothing if the id given does not correspond
     * to any records in the database.  Also removes the record from the screen.
     * @param image_id The id of the project to be deleted in the database
     */
    self.deleteExistingProject = function(image_id) {
        var doDelete = window.confirm("Are you sure you wish to delete this project?\n\n" +
        "This action cannot be undone.");
        if (!doDelete) {
            return;
        }
        var data = {
            'action': 'deleteExistingProject',
            'image_id': parseInt(image_id)
        };
        $.post(ajaxurl, data, function(ajaxInfo) {
            $("#record_" + image_id).remove();

            var element = $(".displaying-num:eq(0)");
            var num = parseInt(element.text().split(" ")[0]) - 1;

            if (num === 1) {
                element.text("1 item");
                $(".displaying-num:eq(1)").text("1 item");
            } else {
                element.text(num + " items");
                $(".displaying-num:eq(1)").text(num + " items");
            }
        });
    };

    self.getEditor = function(imageLink) {
        var params = "&imageLink="+imageLink;
        window.location= window.location+params;
    };

    self.buyNow = function() {
        var win = window.open('http://digiwidgets.com/buy-now/', '_blank');
        win.focus();
    };

    $("#templateDropdownNewProject").change(function() {
        if($(this).find("option:selected").val() === "0,0,Add New Template") {
            $("#thankYouAd").show();
            var existingHeight = $('#existingProjectContainer').height();
            $("#fade2").css('height', existingHeight + 'px');
            $("#fade2").show();
            $("#templateDropdownNewProject").val( '' );
        } else {
            $("#newTemplateContainer").slideUp();
            $("#createTemplateTitle").prop('required',false);
            $("#createTemplateWidth").prop('required',false);
            $("#createTemplateHeight").prop('required',false);
        }
    });

    $("#templateDropdownDuplicateProject").change(function() {
        if($(this).find("option:selected").val() === "0,0,Add New Template") {
            $("#thankYouAd").show();
            var existingHeight = $('#existingProjectContainer').height();
            $("#fade2").css('height', existingHeight + 'px');
            $("#fade2").show();
            $("#templateDropdownDuplicateProject").val( '' );
        } else {
            $("#duplicateTemplateContainer").slideUp();
            $("#createDuplicateTemplateTitle").prop('required',false);
            $("#createDuplicateTemplateWidth").prop('required',false);
            $("#createDuplicateTemplateHeight").prop('required',false);
        }
    });


    self.duplicateProject = function() {
        //Hide the project chooser container
        var newProjectContainer = document.getElementById("duplicateProjectContainer");
        newProjectContainer.style.visibility = 'hidden';
        var image_url = $('input[name="imageLink"]').val();
        // Let's assign the url value to the input field
        $('#wpfooter').css('margin-top', '0px');
        var projectTitle = $('#duplicateProjectTitle').val();
        var data = {
            'action': 'createNewFromExistingProject',
            'url' : image_url,
            'title' : projectTitle
        };
        // ajaxurl is loaded from digiwidgets-image-editor.php
        $.post(ajaxurl, data, function(ajaxInfo) {
            var option = document.getElementById("templateDropdownDuplicateProject").value;
            var templateSettings = {
                title: "",
                width: "",
                height: ""
            };
            if(option && option !== '0,0,Add New Template') {
                option = option.split(',');
                templateSettings.width = option[0];
                templateSettings.height = option[1];
                templateSettings.title = option[2];
                var params = "&imageLink="+ajaxInfo+"&template_width="+option[0]+"&template_height="+option[1]+"&template_title="+option[2]+"&project_title="+projectTitle;
                //Send to Image Editor
                window.location= window.location+params;
            } else {
                templateSettings.title = document.getElementById("createDuplicateTemplateTitle").value;
                templateSettings.width = document.getElementById("createDuplicateTemplateWidth").value;
                templateSettings.height = document.getElementById("createDuplicateTemplateHeight").value;
                option = [templateSettings.width,templateSettings.height,templateSettings.title];
                var data = {
                    'action': 'addNewTemplate',
                    'title' : templateSettings.title,
                    'width' : templateSettings.width,
                    'height' : templateSettings.height
                };
                // ajaxurl is loaded from digiwidgets-image-editor.php
                $.post(ajaxurl, data, function(msg) {
                    var params = "&imageLink="+ajaxInfo+"&template_width="+templateSettings.width+"&template_height="+templateSettings.height+"&template_title="+templateSettings.title+"&project_title="+projectTitle;
                    //Send to Image Editor
                    window.location= window.location+params;
                });
            }
        });
    };


    self.checkNewProjectInfo = function() {
        var image = wp.media({
            title: 'Upload Image',
            // multiple: true if you want to upload multiple files at once
            multiple: false,
            frame: 'select',
            library: {
                type: 'image' // limits the frame to show only images
            }
        }).open()
            .on('select', function (e) {
                //Hide the project chooser container
                var newProjectContainer = document.getElementById("newProjectContainer");
                newProjectContainer.style.visibility = 'hidden';
                // This will return the selected image from the Media Uploader, the result is an object
                var uploaded_image = image.state().get('selection').first();
                // We convert uploaded_image to a JSON object to make accessing it easier
                var image_url = uploaded_image.toJSON().url;
                // Let's assign the url value to the input field
                $('#wpfooter').css('margin-top', '0px');
                var projectTitle = $('#projectTitle').val();
                var data = {
                    'action': 'createNewFromExistingProject',
                    'url' : image_url,
                    'title' : projectTitle
                };
                // ajaxurl is loaded from digiwidgets-image-editor.php
                $.post(ajaxurl, data, function(ajaxInfo) {
                    var option = document.getElementById("templateDropdownNewProject").value;
                    var templateSettings = {
                        title: "",
                        width: "",
                        height: ""
                    };
                    if(option && option !== '0,0,Add New Template') {
                        option = option.split(',');
                        templateSettings.width = option[0];
                        templateSettings.height = option[1];
                        templateSettings.title = option[2];
                        var params = "&imageLink="+ajaxInfo+"&template_width="+option[0]+"&template_height="+option[1]+"&template_title="+option[2]+"&project_title="+projectTitle;
                        //Send to Image Editor
                        window.location= window.location+params;
                    } else {
                        templateSettings.title = document.getElementById("createTemplateTitle").value;
                        templateSettings.width = document.getElementById("createTemplateWidth").value;
                        templateSettings.height = document.getElementById("createTemplateHeight").value;
                        option = [templateSettings.width,templateSettings.height,templateSettings.title];
                        var data = {
                            'action': 'addNewTemplate',
                            'title' : templateSettings.title,
                            'width' : templateSettings.width,
                            'height' : templateSettings.height
                        };
                        // ajaxurl is loaded from digiwidgets-image-editor.php
                        $.post(ajaxurl, data, function(msg) {
                            var params = "&imageLink="+ajaxInfo+"&template_width="+templateSettings.width+"&template_height="+templateSettings.height+"&template_title="+templateSettings.title+"&project_title="+projectTitle;
                            //Send to Image Editor
                            window.location= window.location+params;
                        });
                    }
                });
            });
        $('#media-attachment-date-filters').css('width', '200px');
    };

    return $.extend({},self);
})(jQuery);
