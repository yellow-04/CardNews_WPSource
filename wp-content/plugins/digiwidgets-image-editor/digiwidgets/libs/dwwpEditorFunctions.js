/* global jQuery, wp, DWWPSettings, window, Mousetrap, Canvas2Image, fabric, ajaxurl */
// Expecto Perfecto
window.ImageFunctions = (function ($, fabric) {
    $('#fade').show();
    'use strict';
    // Global Variables
    var idOfImageInGallery;
    var imagesOfGalleryBox;
    var prevIndex;
    var newIndex;
    var difference;
    var filterIsApplied;
    var textId = 0;
    var projectTitle;
    var galleryShouldBeUpdated = true;
    var imageScaleValue, imageRotateValue;
    var created = false;
    /**
     * In event of an error, captures the error and logs it into the database and then lets it go to the console
     * @param msg Specific errror message displayed on the console
     * @param url File error occurred in
     * @param lineNumber Line number of error
     * @param colno Column of error
     * @param error Full stacktrace of the error (includes msg)
     * @returns {boolean} Seems to govern whether or not this handler has handled the error.  If false, it passes the
     * error along to the console
     */
    window.onerror = function(msg, url, lineNumber, colno, error) {

        // Possible browser compatability issue
        if (!error || !error.stack) {
            error = {};
            error.stack = msg;
        }

        var data = {
            'action' : 'logError',
            'error' : msg + " at " + url + ":" + lineNumber + ", " + colno,
            'stackTrace' : error.stack
        };
        $.post(ajaxurl, data);

        return false;
    };

    /**
     * Send an error report through the PHP backend to the server.  Will send an error report whether or not the
     * automatic system has recently sent one.
     */
    function sendErrorFunction() {

        $('#sendErrorText').val("");
        created = true;
        var dialog = $('#sendErrorDialog');
        // Match WP text style
        dialog.removeClass('ui-widget');

        dialog.dialog('open');

        // Issues with jQuery stemming from changes to the way it is imported
        $('.ui-dialog').css('z-index', 10);
        $('.ui-widget-overlay').css('position', 'fixed');
        // This seems to get jacked up a lot.  If this ends up riding over the dialog, the user's pretty screwed
        $('.ui-widget-overlay').css('z-index', 9);

    }

    var self = {};
    // Adds a pointer to the action grid
    var fastAction = document.getElementById('fastActionContainerID');

    //IE8 Compatability Fix
    if (!Date.now) {
        Date.now = function() { return new Date().getTime(); };
    }

    function openModal() {
        $("#wpwrap").css("cursor", "wait");
    }

    function closeModal() {
        $("#wpwrap").css("cursor", "auto");
    }

    fabric.Image.filters.Contrast = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
        type: 'Contrast',
        initialize: function(options) {
            if (!options) {
                options = {};
            }
            this.contrast = options.contrast || 0;
        },

        applyTo: function(canvasEl) {
            var contrast = Math.max(0,this.contrast+1),
                context = canvasEl.getContext('2d'),
                imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                data = imageData.data,
                p = canvasEl.width * canvasEl.height,
                pix = p*4, pix1, pix2, mul, add, r, g, b;


            mul = contrast;
            add = - contrast * 128 + 128;

            while (p--) {
                if ((r = data[pix-=4] * mul + add) > 255 ) {
                    data[pix] = 255;
                } else if (r < 0) {
                    data[pix] = 0;
                } else {
                    data[pix] = r;
                }

                if ((g = data[pix1=pix+1] * mul + add) > 255 ) {
                    data[pix1] = 255;
                } else if (g < 0) {
                    data[pix1] = 0;
                } else {
                    data[pix1] = g;
                }

                if ((b = data[pix2=pix+2] * mul + add) > 255 ) {
                    data[pix2] = 255;
                } else if (b < 0) {
                    data[pix2] = 0;
                } else {
                    data[pix2] = b;
                }
            }

            context.putImageData(imageData, 0, 0);
        },

        toObject: function() {
            return $.extend(this.callSuper('toObject'), {
                contrast: this.contrast
            });
        }
    });

    fabric.Image.filters.Contrast.fromObject = function (object, callback) {
        return new fabric.Image.filters.Contrast(object);
    };

    $(document)
        .ajaxStart(function () {
            openModal();
        })
        .ajaxStop(function () {
            closeModal();
        });

    $(document).ready(function() {
        /* jshint ignore:start */
        model = _initializeKnockout();
        _initializeSpectrum();
        _initializeTypography();
        /* jshint ignore:end */

        // Create all the click listeners
        /* This might be a horrible mistake...
         * As it stands right now I can't tell if doing it like this is a bad decision or not,
         * but it may well be.  Probably going to need to clean it up in the future by removing
         * the createClickListener function.
         */
        createClickListener(divButtons.sendErrorTab(), sendErrorFunction);
        $( 'div#sendErrorDialog').on( "dialogopen", function( event, ui ) {
            $('#errorLogsView').hide();

            var send = {
                'action' : 'logError',
                'error' : 'User Reported Error',
                'stackTrace' : $("#sendErrorText").val(),
                'sendLog' : false,
                'getLogs' : true
            };
            $.post(ajaxurl, send, function(msg) {
                document.getElementById("errorLogsView").value = msg;

            });
        });

        $("#sendErrorDialog").dialog({
            resizable: false,
            width:'auto',
            height:'auto',
            modal: true,
            autoOpen: false,
            buttons: {
                "Send Report": function(event) {

                    // For one reason or another, jQueryUI attempts to call this function and the cancel on creation.
                    // We don't want that here, and don't really care about cancel, so we just block the first call
                    if (!created) {
                        created = true;
                        return;
                    }

                    var data = {
                        'action' : 'logError',
                        'error' : 'User Reported Error',
                        'stackTrace' : $("#sendErrorText").val(),
                        'sendLog' : true,
                        'getLogs' : false
                    };

                    $.post(ajaxurl, data);
                    $("#sendErrorDialog").dialog("close");
                },
                "Cancel": function(event) {
                    $("#sendErrorDialog").dialog("close");
                }
            }
        });

        $("#previewImageDialog").dialog({
            resizable: true,
            modal: true,
            autoOpen: false
        });

        // Hijack and replace standard jQueryUI CSS
        var buttons = $('.ui-dialog-buttonpane').find('button');
        buttons.addClass('button button-primary');
        $(buttons[0]).text("Send Report");
        $(buttons[1]).text("Cancel");
        // If other ids are added there is a chance this will break since it looks for the first dialog.
        $("#ui-id-1").parent().addClass('errorDialogOverride');
        // Why this is needed, I don't know.  But, the title sometimes tries to display inline with everything else
        $("<br>").insertBefore("#sendErrorDialog");
        // Give all the jquery modals the same close icon as the media popup
        var closeButton = $('.ui-dialog-titlebar-close');
        closeButton.removeClass('ui-dialog-titlebar-close').addClass('button-link media-modal-close');
        closeButton.append($("<span class='media-modal-icon'></span>"));

        createClickListener(divButtons.changeCanvasBackgroundButton(), changeCanvasBackgroundFunction);
        $( "#transformToolOptions" ).accordion({header: "> div > h3",heightStyle: "content"});
        $( "#transformToolOptions" ).draggable();
        $( "#borderToolOptions").draggable();
        var dropdown = document.getElementById("templateDropdown");
        dropdown.addEventListener("change", function(e) {
            optionCheck();
            $("#templateDropdown").blur();
        });

        /*
         * Triggers the media upload button and adds the image to the canvas
         * @param event
         */
        $('#upload-btn').click(function (e) {
            e.preventDefault();
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
                    // This will return the selected image from the Media Uploader, the result is an object
                    var uploaded_image = image.state().get('selection').first();
                    // We convert uploaded_image to a JSON object to make accessing it easier
                    var image_url = uploaded_image.toJSON().url;
                    // Let's assign the url value to the input field
                    if (imageLink === "") {
                        DWWPSettings.imageLink = image_url;
                        imageLink = image_url;
                        addImageFromURL(image_url, true, templateSettings);
                    }
                    else {
                        templateSettings.title = "";
                        templateSettings.width = "";
                        templateSettings.height = "";
                        addImageFromURL(image_url, false, templateSettings);
                    }
                    canvas.renderAll();
                });
            $('#media-attachment-date-filters').css('width', '200px');
        });

        $('.button-wrap').on("click", function () {
            $(this).toggleClass('button-active');
        });

        $("#resizeButton").hover(function () {
            $("#resizeOptions").slideDown("fast");
        });
        $("#resizeOptions").bind("mouseleave", function () {
            $("#resizeOptions").slideUp("medium");
        });

        // Listener to provide the border for the entire canvas
        canvas.on("after:render", function(e) {

            // As long as they have defined a width for the line, the border will be drawn.  Default color is black
            if (canvas.lineWidth) {
                self.drawCanvasBorderFunction();
            }

        });

        $("#borderToolOptions").hide();

        $("#borderImageStyleValue").spectrum("set", "black");
        $("#borderImageStyleValue").spectrum("enable");

        // gallery presentation part one begins

        /**
         * Add a thumb thumbnail image representing its original image in the canvas into the gallery box.
         * Every image that is in the main canvas should be added into the gallery box using this function.
         *
         */
        canvas.on('object:added', function(options) {
            $("#sortable").empty();
            imagesOfGalleryBox = [];
            idOfImageInGallery = -1;
            textId = 0;
            var objects = canvas.getObjects();
            for (var i = 0; i < objects.length; i ++) {
                idOfImageInGallery++;
                objects[i].id = idOfImageInGallery;
                var listItem = document.createElement("li");
                listItem.id = objects[i].id;
                var wrapper = document.createElement("div");
                if (objects[i].type === "i-text") {
                    textId ++;
                    var text = document.createElement("p");
                    text.className = "textInGallery";
                    text.id = "textInGallery" + textId;
                    text.innerHTML = "Text " + textId;
                    wrapper.appendChild(text);
                    listItem.appendChild(wrapper);
                    $('#sortable').prepend(listItem);
                    imagesOfGalleryBox.unshift(listItem);
                }
                else if (objects[i].type === "image") {

                    var imageCreated = document.createElement("img");
                    imageCreated.src = objects[i].getSrc();
                    var widthRatio = 97 / objects[i].width;
                    var lengthRatio = 60 / objects[i].height;

                    if (objects[i].width <= 97 && objects[i].height <= 60) {
                        imageCreated.width = objects[i].width;
                        imageCreated.length = objects[i].height;
                    }
                    else {
                        if (widthRatio <= lengthRatio) {
                            imageCreated.width = objects[i].width * widthRatio;
                            imageCreated.length = objects[i].height * widthRatio;
                        }
                        else {
                            imageCreated.width = objects[i].width * lengthRatio;
                            imageCreated.length = objects[i].height * lengthRatio;
                        }
                    }
                    wrapper.appendChild(imageCreated);
                    listItem.appendChild(wrapper);
                    $('#sortable').prepend(listItem);
                    imagesOfGalleryBox.unshift(listItem);
                }
            }
            if (canvas.getActiveObject()) {
                canvas.fire('object:selected');
            }
        });

        /*
         * Synchronize filter application in the canvas with filter application in the gallery box.
         * If a user changes filter application of the canvas, the same filter application change should take place in the gallery box.
         *
         */
        canvas.on('after:render', function(options) {
            $('#fade').hide();
            if (filterIsApplied || galleryShouldBeUpdated) {
                filterIsApplied = false;
                $("#sortable").empty();
                imagesOfGalleryBox = [];
                idOfImageInGallery = -1;
                textId = 0;
                var objects = canvas.getObjects();
                for (var i = 0; i < objects.length; i ++) {
                    idOfImageInGallery++;
                    objects[i].id = idOfImageInGallery;
                    var listItem = document.createElement("li");
                    listItem.id = objects[i].id;
                    var wrapper = document.createElement("div");
                    if (objects[i].type === "i-text") {
                        textId ++;
                        var text = document.createElement("p");
                        text.className = "textInGallery";
                        text.id = "textInGallery" + textId;
                        text.innerHTML = "Text " + textId;
                        wrapper.appendChild(text);
                        listItem.appendChild(wrapper);
                        $('#sortable').prepend(listItem);
                        imagesOfGalleryBox.unshift(listItem);
                    }
                    else if (objects[i].type === "image") {

                        var imageCreated = document.createElement("img");
                        imageCreated.src = objects[i].getSrc();
                        var widthRatio = 97 / objects[i].width;
                        var lengthRatio = 60 / objects[i].height;

                        if (objects[i].width <= 97 && objects[i].height <= 60) {
                            imageCreated.width = objects[i].width;
                            imageCreated.length = objects[i].height;
                        }
                        else {
                            if (widthRatio <= lengthRatio) {
                                imageCreated.width = objects[i].width * widthRatio;
                                imageCreated.length = objects[i].height * widthRatio;
                            }
                            else {
                                imageCreated.width = objects[i].width * lengthRatio;
                                imageCreated.length = objects[i].height * lengthRatio;
                            }
                        }
                        wrapper.appendChild(imageCreated);
                        listItem.appendChild(wrapper);
                        $('#sortable').prepend(listItem);
                        imagesOfGalleryBox.unshift(listItem);
                    }
                }
                if (canvas.getActiveObject()) {
                    canvas.fire('object:selected');
                }
            }

            // Make sure the save thing shows up right below the admin bar
            $("#saveBox").css("top", $("#wpadminbar").height() + "px");

        });

        /*
         * Synchronize selection in the canvas with selection in the gallery box.
         * If a user selects an original image in the canvas, the corresponding thumbnail image in the gallery box should be selected.
         *
         */
        canvas.on('object:selected', function(options) {
            var object = canvas.getActiveObject();
            if (object) {
                galleryShouldBeUpdated = false;
                for (var i = 0; i < imagesOfGalleryBox.length; i++) {
                    if (parseInt(imagesOfGalleryBox[i].id) === object.id) {
                        $('#sortable li').eq(i).addClass('ui-selected');
                        $('#sortable li').eq(i).siblings().removeClass('ui-selected');
                    }
                }
                if (canvas.getActiveGroup()) {
                    positionBtn(canvas.getActiveGroup());
                    $('#sortable').children().removeClass('ui-selected');
                    $('#galleryDelete').prop('disabled',true).addClass('disabled');
                    $('#galleryCenter').prop('disabled',true).addClass('disabled');
                }
                else {
                    $('#galleryDelete').prop('disabled',false).removeClass('disabled');
                    $('#galleryCenter').prop('disabled',false).removeClass('disabled');
                    initializeTransformOption();
                }
            }
        });

        /*
         * Synchronize selection in the canvas with selection in the gallery box.
         * If there is no original image selected in the canvas, there should be no thumbnail image selected in the gallery box.
         *
         */
        canvas.on('selection:cleared', function(options) {
            galleryShouldBeUpdated = true;
            self.disableToolSetButtons();
            $('#galleryDelete').prop('disabled',true).addClass('disabled');
            $('#galleryCenter').prop('disabled',true).addClass('disabled');
            //$('#galleryReset').prop('disabled',true).addClass('disabled');
            $('#sortable').children().removeClass('ui-selected');
            if (canvas.getObjects() && canvas.getObjects().length !== 0) {
                var objects = canvas.getObjects();
                var clone = imagesOfGalleryBox.slice(0);
                for (var i = 0; i < objects.length; i ++) {
                    for (var j = 0; j < clone.length; j++) {
                        if (objects[i].id === clone[j].id) {
                            imagesOfGalleryBox[i] = clone[j];
                        }
                    }
                }
                imagesOfGalleryBox.reverse();
                $("#sortable").empty();
                for (i = 0; i < imagesOfGalleryBox.length; i ++) {
                    $('#sortable').append(imagesOfGalleryBox[i]);
                }
            }

            btn.style.visibility = 'hidden';
        });

        /*
         * Enable image selection and z-order change in the gallery box.
         * Synchronize selection in the gallery box with selection in the canvas.
         * If a user selects a thumbnail image in the gallery box, the corresponding original image should be selected.
         *
         */
        $("#sortable").on('click', 'li', function() {
            $(this).siblings().removeClass('ui-selected');
            var targetId = parseInt($(this).attr('id'));
            var target;
            for (var i = 0; i < canvas.getObjects().length; i++) {
                if (canvas.getObjects()[i].id === targetId) {
                    target = canvas.getObjects()[i];
                    i = canvas.getObjects().length;
                }
            }
            canvas.setActiveObject(target);
        });

        /*
         * Enable image selection and z-order change in the gallery box.
         * Synchronize selection in the gallery box with selection in the canvas.
         * If a user selects a thumbnail image in the gallery box, the corresponding original image should be selected.
         * Synchronize z-order change of the gallery box with that of the canvas.
         * If a user changes the z-order in the gallery box, the z-order in the canvas should also be changed accordingly.
         *
         */
        $('#sortable').sortable({
            opacity: 0.9,
            items: "> li",
            handle: 'div',
            tolerance: 'pointer',
            placeholder: 'ui-state-highlight ui-state-highlight-gallery',
            start: function(e, ui) {
                prevIndex =  ui.item.index();
            },
            update: function(event, ui) {
                newIndex = ui.item.index();
                var lastIndexOfCanvas, object, i, temp;
                if (newIndex > prevIndex) {
                    difference = newIndex - prevIndex;
                    lastIndexOfCanvas = canvas.getObjects().length - 1;
                    object = canvas.getObjects()[lastIndexOfCanvas - prevIndex];
                    for (i = 0; i < difference; i ++) {
                        canvas.sendBackwards(object);
                    }
                    for (i = prevIndex; i < newIndex; i ++) {
                        temp = imagesOfGalleryBox[i + 1];
                        imagesOfGalleryBox[i + 1] = imagesOfGalleryBox[i];
                        imagesOfGalleryBox[i] = temp;
                    }
                    if (difference === 1) {
                        self.saveCommandHistory(difference + ' Layer Back');
                    }
                    else {
                        self.saveCommandHistory(difference + ' Layers Back');
                    }
                }
                else if (prevIndex > newIndex) {
                    difference = prevIndex - newIndex;
                    lastIndexOfCanvas = canvas.getObjects().length - 1;
                    object = canvas.getObjects()[lastIndexOfCanvas - prevIndex];
                    for (i = 0; i < difference; i++) {
                        canvas.bringForward(object);
                    }
                    for (i = prevIndex; i > newIndex; i--) {
                        temp = imagesOfGalleryBox[i - 1];
                        imagesOfGalleryBox[i - 1] = imagesOfGalleryBox[i];
                        imagesOfGalleryBox[i] = temp;
                    }
                    if (difference === 1) {
                        self.saveCommandHistory(difference + ' Layer Forward');
                    }
                    else {
                        self.saveCommandHistory(difference + ' Layers Forward');
                    }

                }
            }
        });

        /*
         * Delete a thumbnail image from the gallery box.
         *
         */
        function removeFromGalleryBox(targetObejct) {
            for (var i = 0; i < imagesOfGalleryBox.length; i ++) {
                if (targetObejct.id === imagesOfGalleryBox[i].id) {
                    $("#sortable li").eq(i).remove();
                    imagesOfGalleryBox.splice(i, 1);
                    i = imagesOfGalleryBox.length;
                }
            }
        }

        /*
         * Delete an image from the canvas and delete the corresponding thumbnail image from the gallery box using the "gallery delete image" button..
         *
         */
        $("#galleryDelete").click(function (e) {
            var target = canvas.getActiveObject();
            if (target) {
                removeFromGalleryBox(target);
                canvas.remove(target);
                btn.style.visibility = 'hidden';
                if (target.type === "i-text") {
                    self.saveCommandHistory('Remove Text');
                }
                else {
                    self.saveCommandHistory('Remove Image');
                }
            }
        });

        /*
         * Center the selected image in the canvas using the "gallery center image" button.
         *
         */
        $("#galleryCenter").click(function (e) {
            var object = canvas.getActiveObject();
            if (object) {
                object.set({
                    borderColor: "rgba(102,153,255,0.75)",
                    cornerColor: "rgba(102,153,255,0.5)",
                    cornerSize: 12,
                    transparentCorners: true
                });
                canvas.centerObject(object);
                object.setCoords();
                positionBtn(object);
                self.saveCommandHistory('Center Image');
            }
        });

        $('#galleryDelete').prop('disabled',true).addClass('disabled');
        $('#galleryCenter').prop('disabled',true).addClass('disabled');

        // Change the color of the plus icon when the user hovers over it.
        $("#upload-btn").hover(function(e) {
            $("#upload-btn").animate({color: "#0073AA"}, "fast");
        }, function(e) {
            $("#upload-btn").animate({color: "#EEEEEE"}, "fast");
        });
        // gallery presentation part one ends
    });

    // gallery presentation part two begins

    /*
     * Synchronize z-order change of the canvas with that of the gallery box.
     * If a user changes the z-order in the canvas, the z-order in the gallery box should be also be changed accordingly.
     * If a user moves an original image back for one position in the canvas, the corresponding thumbnail image should also move back for one position in the gallery box.
     *
     */
    function sendImageBackInGalleryBox(activeObject) {
        for (var i = 0; i < imagesOfGalleryBox.length; i ++) {
            if (activeObject.id === parseInt(imagesOfGalleryBox[i].id) && i !== imagesOfGalleryBox.length - 1) {
                var targetId = i + 1;
                $("#sortable li").eq(i).insertAfter($("#sortable li").eq(targetId));
                var temp = imagesOfGalleryBox[i + 1];
                imagesOfGalleryBox[i + 1] = imagesOfGalleryBox[i];
                imagesOfGalleryBox[i] = temp;
                i = imagesOfGalleryBox.length;

            }
        }
    }

    /*
     * Synchronize z-order change of the canvas with that of the gallery box.
     * If a user changes the z-order in the canvas, the z-order in the gallery box should be also be changed accordingly.
     * If a user moves an original image back to the end in the canvas, the corresponding thumbnail image should also move back to the end in the gallery box.
     *
     */
    function sendImageBackToEndInGalleryBox(activeObject) {
        for (var i = 0; i < imagesOfGalleryBox.length; i ++) {
            if (activeObject.id === parseInt(imagesOfGalleryBox[i].id) && i !== imagesOfGalleryBox.length - 1) {
                var targetId = imagesOfGalleryBox.length - 1;
                $("#sortable li").eq(i).insertAfter($("#sortable li").eq(targetId));
                var temp = imagesOfGalleryBox[i];
                for (var j = i; j < imagesOfGalleryBox.length - 1; j ++) {
                    imagesOfGalleryBox[j] = imagesOfGalleryBox[j + 1];
                }
                imagesOfGalleryBox[imagesOfGalleryBox.length - 1] = temp;
                i = imagesOfGalleryBox.length;
            }
        }
    }

    /*
     * Synchronize z-order change of the canvas with that of the gallery box.
     * If a user changes the z-order in the canvas, the z-order in the gallery box should also be changed accordingly.
     * If a user brings an original image forward for one position in the canvas, the corresponding thumbnail image should also move to the front for one position.
     *
     */
    function sendImageFowardInGalleryBox(activeObject) {
        for (var i = 0; i < imagesOfGalleryBox.length; i ++) {
            if (activeObject.id === parseInt(imagesOfGalleryBox[i].id) && i !== 0) {
                var targetId = i - 1;
                $("#sortable li").eq(i).insertBefore($("#sortable li").eq(targetId));
                var temp = imagesOfGalleryBox[i - 1];
                imagesOfGalleryBox[i - 1] = imagesOfGalleryBox[i];
                imagesOfGalleryBox[i] = temp;
                i = imagesOfGalleryBox.length;
            }
        }
    }

    /*
     * Synchronize z-order change of the canvas with that of the gallery box.
     * If a user changes the z-order in the canvas, the z-order in the gallery box should also be changed accordingly.
     * If a user brings an original image forward to the very front in the canvas, the corresponding thumbnail image should also move to the very front in the gallery box.
     *
     */
    function sendImageForwardToFrontInGalleryBox(activeObject) {
        for (var i = 0; i < imagesOfGalleryBox.length; i ++) {
            if (activeObject.id === parseInt(imagesOfGalleryBox[i].id) && i !== 0) {
                var targetId = 0;
                $("#sortable li").eq(i).insertBefore($("#sortable li").eq(targetId));

                var temp = imagesOfGalleryBox[i];
                for (var j = i; j > 0; j --) {
                    imagesOfGalleryBox[j] = imagesOfGalleryBox[j - 1];
                }
                imagesOfGalleryBox[0] = temp;
                i = imagesOfGalleryBox.length;
            }
        }
    }

    /*
     * Delete a thumbnail image from the gallery box.
     *
     */
    function removeFromGalleryBox(targetObejct) {
        for (var i = 0; i < imagesOfGalleryBox.length; i ++) {
            if (targetObejct.id === parseInt(imagesOfGalleryBox[i].id)) {
                $("#sortable li").eq(i).remove();
                imagesOfGalleryBox.splice(i, 1);
                i = imagesOfGalleryBox.length;
            }
        }
    }

    $(window).bind('beforeunload', function(){
        var projectTitleEditorValue = $('#projectTitleEditor').val();
        if (typeof commandHistory[commandHistory.length-1] !== "undefined") {
            if((commandHistory[commandHistory.length-1].saveAction !== "Save Image") || !projectTitle || (projectTitleEditorValue !== projectTitle) ){
                var newProjectCheck = 1;
                for (var i = 0; i < commandHistory.length; i++) {
                    if(commandHistory[i].saveAction === "Save Image"){
                        newProjectCheck = 0;
                    }
                }
                if(newProjectCheck === 0) {
                    return 'You have unsaved changes to your project. Are you sure you want to leave?';
                }
            }
        }

    });

    self.projectCloseFunction = function () {
        var reloadURL = window.location.pathname + '?page=imageEditorPage.php';
        window.location.href = reloadURL;
    };

    // gallery presentation part two ends
    // This is needed to save the image to the database
    var databaseImageSrc;
    var disableActionButtons = false;
    //Where we store the command history for each session
    var commandHistory = [];
    var fullCommandHistory = [];
    var undoArray = [];
    // Store the most recently copied image
    var copiedImage;
    var useTimestampChange = false;
    $('#inline-btn').attr("src", DWWPSettings.path+'/remove.png');
    projectTitle = DWWPSettings.projectTitle;
    var paged = DWWPSettings.paged;
    var postID = DWWPSettings.postID;
    var imageLink = DWWPSettings.imageLink;
    var templateSettings = {
        title: DWWPSettings.templateTitle,
        width: DWWPSettings.templateWidth,
        height: DWWPSettings.templateHeight
    };
    var applyTemplate;
    var canvasItems = ['canvasWidth', 'canvasHeight','templateTitle', 'lineWidth', 'borderStrokeStyle', 'scaleX', 'scaleY',
        'filters','opacity','filters_count', 'left', 'top', 'stroke', 'strokeWidth'];
    // Holds the view model for ko
    var model;
    self.applyTemplateFunction = function (canvasWidth, canvasHeight, templateTitle) {
        canvas.canvasWidth = canvasWidth;
        canvas.canvasHeight = canvasHeight;
        canvas.templateTitle = templateTitle;
        canvas.deactivateAll().renderAll();
        btn.style.visibility = 'hidden';
        var optionValue = canvasWidth + ',' + canvasHeight + ',' + templateTitle;
        if($("#templateDropdown option[value='"+optionValue+"']").length > 0){
            $("#templateDropdown option[value='"+optionValue+"']").attr('selected', true);
        }
        else{
            $("#templateDropdown option[value='']").attr('selected', true);
        }
        templateSettings.title = templateTitle;
        templateSettings.width = canvasWidth;
        templateSettings.height = canvasHeight;
        canvas.setWidth(canvasWidth);
        canvas.setHeight(canvasHeight);
        var imgs = canvas.getObjects();
        imgs[0].canvasWidth = templateSettings.width;
        imgs[0].canvasHeight = templateSettings.height;
        imgs[0].templateTitle = templateSettings.title;
        canvas.canvasWidth = templateSettings.width;
        canvas.canvasHeight = templateSettings.height;
        canvas.templateTitle = templateSettings.title;
        //Redefining the canvas dimensions for each object is done in the render function, so we don't need it here

        for (var i = 0; i < canvas.getObjects().length; i++) {

            var o = canvas.getObjects()[i];

            if ((o.width * o.scaleX) > canvas.width || (o.height * o.scaleY) > canvas.height) {
                if((o.width * o.scaleX -canvas.width) >= ((o.height * o.scaleY) - canvas.height)){
                    o.scaleX = canvas.width/o.width;
                    o.scaleY = o.scaleX;
                }
                else{
                    o.scaleX = canvas.height/o.height;
                    o.scaleY = o.scaleX;
                }
            }
            self.centerFunction(o);
        }

        self.disableToolSetButtons();
        btn.style.visibility = 'hidden';
        $("span.dimmensionDisplay", "#canvasDimmensionDisplay").text(parseInt(canvas.getWidth()) + " x " + parseInt(canvas.getHeight()));
        if(imageLink === ""){
            clickAddImage();
        }
        renderFunction();
        updateFilterCSS();
        self.saveCommandHistory('Apply Template');
    };

    function updateFilterCSS() {
        var left = parseInt($('canvas').css("width"));
        var top = parseInt($('canvas').css("height"));

        left = left + 120;
        top = top + 160 + (220 - top);

        var filterControls = $('#filter-controls');
        filterControls.css('left', left + 'px');
        filterControls.css('top', top + 'px');
    }

        var splitBtn = $('.x-split-button');

        //This will get rid of anything you define in the array for our case we want to remove all empty values
        Array.prototype.clean = function (deleteValue) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === deleteValue) {
                    this.splice(i, 1);
                    i--;
                }
            }
            return this;
        };

        //Gets Formatted JS date
        function getJSDate() {
            var now = new Date();
            var year = "" + now.getFullYear();
            var month = "" + (now.getMonth() + 1);
            if (month.length === 1) {
                month = "0" + month;
            }
            var day = "" + now.getDate();
            if (day.length === 1) {
                day = "0" + day;
            }
            var hour = "" + now.getHours();

            var period;
            if (hour < 12) {
                period = 'am';
            } else {
                period = 'pm';
            }

            if (hour > 12) {
                hour -= 12;
            }

            if (hour.length === 1) {
                hour = "0" + hour;
            }

            var minute = "" + now.getMinutes();
            if (minute.length === 1) {
                minute = "0" + minute;
            }

            return month + "-" + day + '-' + year + ' | ' + hour + ":" + minute + period;
        }

        self.saveCommandHistory = function (action) {
            var canvasJSON = canvas.toJSON(canvasItems);
            canvasJSON.saveAction = action;
            canvasJSON.timestamp = getJSDate();
            if (useTimestampChange !== false) {
                commandHistory.length = parseInt(useTimestampChange) + 1;
                undoArray = [];
                useTimestampChange = false;
            }
            commandHistory.push(canvasJSON);
            commandHistory.clean("");
        };

        var currentWidth;
        var currentHeight;
        currentWidth = $('canvas').css("width");
        currentHeight = $('canvas').css("height");

        var imageUndoChecker = [];
        var canvas = new fabric.Canvas('canvas', {stateful: false});

        // Default color for the border of the canvas
        canvas.borderStrokeStyle = "black";

        var context = document.getElementById('canvas');

        function areObjectsOfType(objectType){
            if (!canvas.getActiveObject() && !canvas.getActiveGroup()){
                return false;
            }
            //i-text or
            //borderedImage
            var object = canvas.getActiveObject();
            if (object){
                return object.type === objectType ? true : false;
            }
            else {
                var objects = canvas.getActiveGroup();
                var isOfType = true;
                objects.forEachObject(function (object) {
                    if (object.type !== objectType) {
                        isOfType = false;
                    }
                });
                return isOfType;
            }
        }


        //filters functions
        var filter = fabric.Image.filters;

        fabric.util.toArray(document.getElementsByClassName('filter-input')).forEach(function(el){
            el.disabled = true;
        });
        $("#blend-mode").prop("disabled",true);
        $('#filter-controls').hide();
        $("#filter-controls").draggable();

        self.showFilters = function() {

            updateFilterCSS();

            $("#filter-controls").toggle();
        };

        $('#borderImageWidthValue').change(function() {
           ImageFunctions.applyImageBorder();
        });

        $('#borderCanvasWidthValue').change(function() {
            ImageFunctions.applyCanvasBorder();
        });

        $("#templateDropdownNewProject").change(function() {
            if($(this).find("option:selected").val() === "0,0,Add New Template") {
                $("#newTemplateContainer").slideDown();
                $("#createTemplateTitle").prop('required',true);
                $("#createTemplateWidth").prop('required',true);
                $("#createTemplateHeight").prop('required',true);
            } else {
                $("#newTemplateContainer").slideUp();
                $("#createTemplateTitle").prop('required',false);
                $("#createTemplateWidth").prop('required',false);
                $("#createTemplateHeight").prop('required',false);
            }
        });

        //filterChecks
        function updateFilterControl(){
            if($('#brightness').is(":checked")){
                $( "#brightnessOptions" ).slideDown("slow");
            }
            else {
                $("#brightnessOptions").slideUp("slow");
            }
            $('#brightness').change(function() {
                if($(this).is(":checked")) {
                    $( "#brightnessOptions" ).slideDown("slow");
                }
                else {
                    $( "#brightnessOptions" ).slideUp("slow");
                }
            });
            if($('#contrast').is(":checked")){
                $( "#contrastOptions" ).slideDown("slow");
            }
            else {
                $("#contrastOptions").slideUp("slow");
            }
            $('#contrast').change(function() {
                if($(this).is(":checked")) {
                    $( "#contrastOptions" ).slideDown("slow");
                }
                else {
                    $( "#contrastOptions" ).slideUp("slow");
                }
            });
        }

        function applyFilter(index, filter) {
            var obj = canvas.getActiveObject();

            var filters = ['Grayscale', 'Invert', 'Sepia', 'Sepia2', 'Brightness', 'Contrast'];
            var i = 0, filter_name;
            if(filter !== false) {
                obj.filters.push(filter);
                obj.applyFilters(canvas.renderAll.bind(canvas));
            } else {
                for(i=0; obj.filters && i < obj.filters.length; i++) {
                    if(obj.filters[i].type === filters[index]) {
                        break;
                    }
                }
                obj.filters.splice(i, 1);
                obj.applyFilters(canvas.renderAll.bind(canvas));

            }
            filterIsApplied = true;
        }

        function applyFilterValue(index, prop, value) {
            var obj = canvas.getActiveObject();

            var filters = ['Grayscale', 'Invert', 'Sepia', 'Sepia2', 'Brightness', 'Contrast'];
            var i=0;
            if(filter !== false)
            {
                for(i=0; obj.filters && i<obj.filters.length; i++)
                {
                    if(obj.filters[i].type === filters[index])
                    {
                        obj.filters[i][prop] = value;
                        obj.applyFilters(canvas.renderAll.bind(canvas));
                    }
                }
            }
            filterIsApplied = true;
        }

        $('#grayscale').on('change',function() {
            applyFilter(0, this.checked && new filter.Grayscale());
            self.saveCommandHistory('Apply Filter');
        });

        $('#invert').on('click',function() {
            applyFilter(1, this.checked && new filter.Invert());
            self.saveCommandHistory('Apply Filter');
        });

        $('#sepia').on('click',function() {
            applyFilter(2, this.checked && new filter.Sepia());
            self.saveCommandHistory('Apply Filter');
        });

        $('#sepia2').on('click',function() {
            applyFilter(3, this.checked && new filter.Sepia2());
            self.saveCommandHistory('Apply Filter');
        });

        $('#brightness').on('click',function() {
            applyFilter(4, this.checked && new filter.Brightness({
                    brightness: parseInt(document.getElementById("brightness-value").value, 10)
                }));
            self.saveCommandHistory('Apply Filter');
        });

        $('#brightness-value').on('change',function() {
            applyFilterValue(4, 'brightness', parseInt(this.value, 10));
            self.saveCommandHistory('Apply Filter');
        });

        $('#contrast').on('change',function(){
            applyFilter(5, this.checked && new filter.Contrast({
                    contrast:document.getElementById("contrast-value").value
                }));
            self.saveCommandHistory('Apply Filter');
        });

        $('#contrast-value').on('change',function() {
            applyFilterValue(5,'contrast', this.value);
            self.saveCommandHistory('Apply Filter');
        });

        function updateFilterCheckbox_select() {
            $('.filter-checkbox').prop('checked',false);
            document.getElementById("brightness-value").value="0";
            document.getElementById("contrast-value").value="1.00";
            var i;
            var obj = canvas.getActiveObject();
            var isNotGroup = (canvas.getActiveGroup() === null);
            if(obj !== null){
                if(isNotGroup){
                    fabric.util.toArray(document.getElementsByClassName('filter-checkbox')).forEach(function(el){
                        el.disabled = false;
                    });
                } else {
                    fabric.util.toArray(document.getElementsByClassName('filter-checkbox')).forEach(function(el){
                        el.disabled = true;
                    });
                }
            }

            if(obj !== null) {
                if (isNotGroup) {
                    for (i = 0; obj.filters && i < obj.filters.length; i++) {
                        var filter_name = "#" + obj.filters[i].type.toLowerCase();
                        $(filter_name).prop('checked', true);

                        if (obj.filters[i].type === "Brightness") {
                            document.getElementById("brightness-value").value = obj.filters[i].brightness;
                        } else if (obj.filters[i].type === "Contrast") {
                            document.getElementById("contrast-value").value = obj.filters[i].contrast;
                        }

                    }

                }
            }
        }

        function updateFilterCheckbox_deselect() {
            fabric.util.toArray(document.getElementsByClassName('filter-checkbox')).forEach(function(el){
                el.checked = false;
                el.disabled = true;
            });
            document.getElementById("brightness-value").value="0";
            document.getElementById("contrast-value").value="1.00";
        }

        var lastSelected = null;

        // TODO: This is broken somehow - it is getting called a hella lot when using input boxes and I don't know why.
        // The variable above exists to counteract that problem
        canvas.on('object:selected',function() {
            self.enableToolSetButtons();
            updateFilterCheckbox_select();
            updateFilterControl();

            //// Set the value of the current border of the selected image to the border slideout

            if (lastSelected !== canvas.getActiveObject()) {

                lastSelected = canvas.getActiveObject();
                $("#borderImageWidthValue").val(canvas.getActiveObject().strokeWidth.toString());
                $("#borderImageStyleValue").spectrum("set", canvas.getActiveObject().stroke);

            }
        });

        canvas.on('selection:cleared',function() {
            updateFilterCheckbox_deselect();
            updateFilterControl();

            // Can be removed if the object:selected listener is corrected
            lastSelected = null;
        });
        //filters functions end.

        //keep track of template applied.
        canvas.on('object:added', function (options) {
            var el = canvas.getObjects();
            var dp = document.getElementById("templateDropdown");
            if(el !== null)
            {
                if(el.length !== 0)
                {
                    if((el[0].templateTitle)&&(dp.value === ""))
                    {
                        var optionValue = el[0].canvasWidth + ',' + el[0].canvasHeight + ',' + el[0].templateTitle;
                        $("#templateDropdown").val(optionValue);
                    }
                    else if(dp.value !== "")
                    {
                        var strs = dp.value.split(",");
                        var width = parseInt(strs[0]);
                        var height = parseInt(strs[1]);
                        el[0].canvasWidth = width;
                        el[0].canvasHeight = height;
                        el[0].templateTitle = strs[2];
                        canvas.templateTitle = strs[2];
                    }
                }
            }
        });

        canvas.on('mouse:down', function (options) {
            //$this.focus();
            if (areObjectsOfType("image")) {
                if (options.target) {
                    if (el && el !== null) {
                        self.disableToolSetButtons();

                    }
                    else {
                        self.enableToolSetButtons();
                    }

                    var selectedImage = options.target;
                    imageUndoChecker.left = selectedImage.left;
                    imageUndoChecker.top = selectedImage.top;
                    imageUndoChecker.scaleX = selectedImage.scaleX;
                    imageUndoChecker.scaleY = selectedImage.scaleY;
                    imageUndoChecker.angle = selectedImage.angle;
                    var startingX = null;
                    var startingY = null;
                    //canvas.setActiveObject(selectedImage);
                    positionBtn(selectedImage);
                    selectedImage.on('moving', function (options) {
                        if (options.e.shiftKey === true) {
                            if (startingX === null || startingY === null) {
                                startingX = this.left;
                                startingY = this.top;
                            }
                            var differenceX = Math.abs(this.left - startingX);
                            var differenceY = Math.abs(this.top - startingY);
                            if (differenceX > 25 || differenceY > 25) {
                                if (differenceX > differenceY) {
                                    this.top = startingY;
                                    this.lockMovementY = true;

                                }
                                else {
                                    this.left = startingX;
                                    this.lockMovementX = true;
                                }
                            }
                        }
                        btn.style.visibility = 'hidden';
                    });
                    selectedImage.on('scaling', function () {
                        btn.style.visibility = 'hidden';
                        this.lockUniScaling = true;
                        if (options.e.altKey === true && options.e.shiftKey === true) {
                            this.lockUniScaling = false;
                            //this.centeredScaling = true;
                        }
                        if(!canvas.getActiveGroup()) {
                            initializeTransformOption();
                        }
                    });
                    selectedImage.on('rotating', function () {
                        btn.style.visibility = 'hidden';
                        if(!canvas.getActiveGroup()) {
                            initializeTransformOption();
                        }
                    });
                    positionBtn(selectedImage);
                }
            }
        });

        canvas.on('mouse:up', function (options) {
            if (options.target) {
                var selectedImage = options.target;
                if(areObjectsOfType('image')) {
                    selectedImage.lockMovementX = false;
                    selectedImage.lockMovementY = false;

                    selectedImage.on('scaling', function () {
                        this.lockUniScaling = true;
                        //this.centeredScaling = false;
                    });

                }
            }
        });


        var el;
        var cropObject, lastActive;
        var tabs = $("#tabs").tabs();
        tabs.find(".ui-tabs-nav").sortable({
            axis: "x",
            stop: function () {
                tabs.tabs("refresh");
            }
        });

        var btn = document.getElementById('inline-btn'),
            btnWidth = 5,
            btnHeight = 5;

        canvas.on('mouse:move', function (options) {
            //if (canvas.getActiveObject() == null && canvas.getActiveGroup() == null) {
            //    btn.style.visibility = 'hidden';
            //    self.disableToolSetButtons();
            //}

        });

        self.deactivateImages = function() {
            canvas.deactivateAll().renderAll();
            btn.style.visibility = 'hidden';
            self.disableToolSetButtons();
    }


        /**
         * Draws a border around the entire canvas with the parameters set within the canvas.  Intended to be executed
         * as the last part of rendering to ensure that the border ends up on top of everything else in the canvas.
         */
        self.drawCanvasBorderFunction = function() {

            var ctx = document.getElementById('canvas').getContext('2d');

            ctx.lineWidth = canvas.lineWidth;

            if (canvas.borderStrokeStyle) {
                ctx.strokeStyle = canvas.borderStrokeStyle;
            }

            ctx.beginPath();

            // Draw the path
            ctx.moveTo(0, 0);
            ctx.lineTo(canvas.width, 0);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.lineTo(0, 0);

            // Actually make the context draw the path
            ctx.stroke();

        };

        /*
         * Properly display remove and grid button based on rotation of image
         */
        function rotateSide(obj) {
            currentWidth = $('#canvas').css("width");
            currentWidth = currentWidth.match(/\d+/)[0];
            currentWidth = Number(currentWidth);
            currentHeight = $('#canvas').css("height");
            currentHeight = currentHeight.match(/\d+/)[0];
            currentHeight = Number(currentHeight);

            var toolbarHeight = $('#fastActionContainerID').css("height");
            toolbarHeight = toolbarHeight.match(/\d+/)[0];
            toolbarHeight = Number(toolbarHeight);

            var heightOffset = 0;
            // Toolbar height will dominate if canvas size is less than this
            if (currentHeight < toolbarHeight) {
                heightOffset = toolbarHeight - currentHeight;
            }

            var widthRatio = (currentWidth / canvas.getWidth());
            var heightRatio = (currentHeight / canvas.getHeight());

            if (widthRatio < 0.5 || heightRatio < 0.5) {
                var ratio = (widthRatio < heightRatio) ? 12 / widthRatio : 12 / heightRatio;
                obj.set({
                    borderColor: 'black',
                    cornerSize: ratio,
                    rotatingPointOffset: 155,
                    transparentCorners: false,
                    borderOpacityWhenMoving: 0.4
                });
            }
            obj.angle = obj.angle % 360;
            if (obj.angle >= 335 || obj.angle <= 74) {
                //Top left corner
                if( obj.oCoords.tl.x < 0){
                    btn.style.left = (-35)+'px';
                } else{
                    btn.style.left = (obj.oCoords.tl.x * widthRatio -  btnWidth / 2 - 40) + 'px';
                }
                if( obj.oCoords.tl.y*heightRatio < 0){
                    btn.style.top = (-Number(currentHeight) - heightOffset)+'px';
                } else{
                    btn.style.top =
                        (obj.oCoords.tl.y * heightRatio - (btnHeight / 2) - currentHeight - heightOffset) + 'px';
                }
            } else if (obj.angle >= 75 && obj.angle <= 150) {
                //Top right corner
                if( obj.oCoords.bl.x*widthRatio < 0){
                    btn.style.left = (-35)+'px';
                } else{
                    btn.style.left = (obj.oCoords.bl.x * widthRatio - btnWidth / 2 - 40) + 'px';
                }
                if( obj.oCoords.bl.y*heightRatio < 0){
                    btn.style.top = (-Number(currentHeight) - heightOffset - 8)+'px';
                } else{
                    btn.style.top =
                        (obj.oCoords.bl.y * heightRatio - (btnHeight / 2) - currentHeight - heightOffset) + 'px';
                }
            } else if (obj.angle >= 151 && obj.angle <= 240) {
                //Bottom right corner
                if( obj.oCoords.br.x*widthRatio < 0){
                    btn.style.left =  (-35)+'px';
                } else{
                    btn.style.left = (obj.oCoords.br.x * widthRatio - btnWidth / 2 - 40) + 'px';
                }
                if( obj.oCoords.br.y*heightRatio < 0){
                    btn.style.top = (-Number(currentHeight) - heightOffset - 8)+'px';
                } else{
                    btn.style.top =
                        (obj.oCoords.br.y * heightRatio - (btnHeight / 2) - currentHeight - heightOffset) + 'px';
                }
            } else {
                //Bottom left corner
                if( obj.oCoords.tr.x*widthRatio < 0){
                    btn.style.left = (-35)+'px';
                } else{
                    btn.style.left = (obj.oCoords.tr.x * widthRatio - btnWidth / 2 - 40) + 'px';
                }
                if( obj.oCoords.tr.y*heightRatio < 0){
                    btn.style.top = (-Number(currentHeight - heightOffset) - 8)+'px';
                } else{
                    btn.style.top =
                        (obj.oCoords.tr.y * heightRatio - (btnHeight / 2) - currentHeight - heightOffset) + 'px';
                }
            }
        }

    /*
     * Centers selected images on the canvas
     */
    self.centerFunction = function (object) {

        if (object) {

            canvas.centerObject(object);
            object.setCoords();
            positionBtn(object);

        } else if (canvas.getActiveGroup()) {
            object = canvas.getActiveGroup();
            canvas.centerObject(object);
            object.setCoords();
            positionBtn(object);
            canvas.getActiveGroup().active = false;
            canvas.setActiveGroup(object);
            self.saveCommandHistory('Center Image');
        } else {
            object = canvas.getActiveObject();
            object.set({
                borderColor:"rgba(102,153,255,0.75)",
                cornerColor:"rgba(102,153,255,0.5)",
                cornerSize: 12,
                transparentCorners: true
            });
            canvas.centerObject(object);
            object.setCoords();
            positionBtn(object);
            self.saveCommandHistory('Center Image');
        }
    };

    /*
     * Positions the grid and remove button properly around the image
     */
    function positionBtn(obj) {
        if( obj.width / obj.canvasWidth  <= 0.4 ){
            btn.style.width = 10;
            btn.style.height = 10;
        }

        if (disableActionButtons !== true) {
            btn.style.visibility= 'visible';
            rotateSide(obj);
        } else {
            btn.style.visibility = 'hidden';
        }
    }

    /*
     * Convenience method to allow for external calls to the positionBtn method
     * @param obj Object or group to have the button positioned on
     * @returns {*}
     */
    self.positionBtn = function(obj) {return positionBtn(obj);};

    canvas.on("object:modified", function(){
           var object = (canvas.getActiveObject()?canvas.getActiveObject():canvas.getActiveGroup());
           if (object){
               var removeButton = document.getElementById('inline-btn');
               removeButton.style.visibility = 'visible';
               positionBtn(object);
           }

        //}
    });

    canvas.on("object:moving", function(){
        var removeButton = document.getElementById('inline-btn');
        removeButton.style.visibility = 'hidden';
    });
    canvas.on("object:scaling", function(){
        var removeButton = document.getElementById('inline-btn');
        removeButton.style.visibility = 'hidden';
    });
    canvas.on("object:rotating", function(){
        var removeButton = document.getElementById('inline-btn');
        removeButton.style.visibility = 'hidden';
    });

    canvas.on("object:selected", function(){
        var object = (canvas.getActiveObject()?canvas.getActiveObject():canvas.getActiveGroup());
        if (object){
            var removeButton = document.getElementById('inline-btn');
            removeButton.style.visibility = 'visible';
            positionBtn(object);
        }
    });

    /*
     * Removes selected images on the canvas
     */
    self.removeImages = function () {
        if (canvas.getActiveGroup()) {
            canvas.getActiveGroup().forEachObject(function (o) {
                removeFromGalleryBox(o);
                canvas.remove(o);
            });
            canvas.discardActiveGroup().renderAll();
            self.saveCommandHistory('Remove Objects');
        } else if (canvas.getActiveObject()) {
            removeFromGalleryBox(canvas.getActiveObject());
            canvas.remove(canvas.getActiveObject());
            if (canvas.getActiveObject.type === "i-text") {
                self.saveCommandHistory('Remove Text');
            }
            else {
                self.saveCommandHistory('Remove Image');
            }
        }
        btn.style.visibility = 'hidden';
        canvas.renderAll();
    };

    /*
     * Rotate the selected image
     */
    var rotateFunction = function (degrees) {
        var object;
        if (canvas.getActiveGroup()) {
            object = canvas.getActiveGroup();
        } else {
            object = canvas.getActiveObject();
        }
        var curAngle = object.getAngle();
        object.setAngle(curAngle + degrees);
        object.setCoords();
        canvas.renderAll();
        positionBtn(object);
        self.saveCommandHistory('Rotate Image');
    };

    self.disableMenuButtons = function () {
        $("#import").prop('disabled',true).addClass('disabled');
        $('#upload-btn').prop('disabled',true).addClass('disabled');
        $('#backgroundColorPicker').spectrum("disable");
        $('#save').prop('disabled',true).addClass('disabled');
        $('#copySave').prop('disabled',true).addClass('disabled');
        $('#preview').prop('disabled',true).addClass('disabled');
        $('#saveDropdown').prop('disabled',true).addClass('disabled');
        $('#templateDropdown').prop('disabled',true).addClass('disabled');
    };

    self.enableMenuButtons = function () {
        $('#sortable').children().prop('disabled', false).removeClass('disabled');
        $("#import").prop('disabled',false).removeClass('disabled');
        $('#upload-btn').prop('disabled',false).removeClass('disabled');
        $('#backgroundColorPicker').spectrum("enable");
        $('#save').prop('disabled',false).removeClass('disabled');
        $('#copySave').prop('disabled',false).removeClass('disabled');
        $('#preview').prop('disabled',false).removeClass('disabled');
        $('#saveDropdown').prop('disabled',false).removeClass('disabled');
        $('#templateDropdown').prop('disabled',false).removeClass('disabled');
    };

    /**
     * Toggles the visibility of the slideout border menu next to the fast action toolbox
     */
    self.toggleBorder = function () {

        var borderToolButton = $("#borderToolButton");
        var borderToolPosition = $("#borderToolButton").position();
        var borderToolOptionsButton = $("#borderToolOptions");
        borderToolOptionsButton.css({ top: borderToolPosition.top - 50, left: (borderToolPosition.left + borderToolButton.width() + 55) });
        if($("#borderToolOptions").is(':visible')){
            $("#borderToolButton").removeClass( "highlightOption" );
        } else {
            $("#borderToolButton").prop('disabled',false).removeClass( "disabled" );
            $("#borderToolButton").addClass( "highlightOption" );

            // Initialize the values for the canvas portion of the border
            if (canvas.lineWidth) {
                $("#borderCanvasWidthValue").val(canvas.lineWidth);
            } else {
                $("#borderCanvasWidthValue").val(0);
            }
            $("#borderCanvasStyleValue").spectrum("set", canvas.borderStrokeStyle);
        }
        borderToolOptionsButton.toggle();
    };

    /**
     * Toggle the visibility of the slideout text menu next to the fast action toolbox
     * @param flag True if text should be displayed, false if not
     */
    self.toggleText = function(flag) {

        var ret = false;

        var textOptions = $("#textOptions");
        var textButton = $("#textButton");
        var textButtonPosition = textButton.position();

        if (flag) {
            $('#textButton').prop('disabled',false).removeClass('disabled');
            if (textOptions.css('display') === 'block') {
                ret = true;
            } else {
                textOptions.css({ top: textButtonPosition.top + 20 + 'px',
                    left: textButtonPosition.left + textButton.width() * 2 + 45 + 'px' });
                textOptions.css('display', 'block');
            }
            fastAction.style.pointerEvents = 'auto';
        } else {
            textOptions.css('display', 'none');
        }

        return ret;
    };

    self.toggleTransform = function () {
        var transformToolButton = $("#transformToolButton");
        var transformToolPosition = $("#transformToolButton").position();
        var transformToolOptionsButton = $("#transformToolOptions");
        transformToolOptionsButton.css({ top: transformToolPosition.top, left: (transformToolPosition.left + transformToolButton.width() + 55) });
        initializeTransformOption();
        if($("#transformToolOptions").is(':visible')){
            $("#transformToolButton").removeClass( "highlightOption" );
        } else {
            $("#transformToolButton").removeClass( "disabled" );
            $("#transformToolButton").addClass( "highlightOption" );
        }
        transformToolOptionsButton.toggle();
    };

    var initializeTransformOption = function (object) {

        object = object || canvas.getActiveObject();
        if(object) {
            //Setting up Resize
            var originalSize = object.height + object.width;
            var altSize = (object.height * object.scaleY) + (object.width * object.scaleX);
            var percentageSize = altSize/originalSize;
            $('#imageScale').val(percentageSize*100);
            var imageScaleValue = percentageSize*100;
            imageRotateValue = object.angle;
            //Setting up Rotate
            $('#imageRotate').val(object.angle);
        } else {
            window.alert("Please select an object or layer");
            $("#transformToolOptions").toggle();
            return;
        }
    };

        /*
         * Flip the image horizontally
         */
        self.flipXFunction = function () {
            var object;
            if (canvas.getActiveGroup()) {
                object = canvas.getActiveGroup();
            } else {
                object = canvas.getActiveObject();
            }

            object.flipX = !object.flipX;
            object.setCoords();

            // Once to flip the image, once to get the border change to be picked up
            // Probably a way to do this with one call, but let's hear it for efficiency
            canvas.renderAll();
            canvas.renderAll();

            positionBtn(object);
            self.saveCommandHistory('Flip H');
        };

        /*
         * Flip the image vertically
         */
        self.flipYFunction = function () {
            var object;
            if (canvas.getActiveGroup()) {
                object = canvas.getActiveGroup();
            } else {
                object = canvas.getActiveObject();
            }

            object.flipY = !object.flipY;
            object.setCoords();

            // Once to flip the image, once to get the border change to be picked up
            // Probably a way to do this with one call, but let's hear it for efficiency
            canvas.renderAll();
            canvas.renderAll();

            positionBtn(object);
            self.saveCommandHistory('Flip V');
        };

        /*
         * Move the currently selected image down to the bottom of the canvas
         */
       self.bottomFunction = function () {
            if (canvas.getActiveGroup()) {
                canvas.getActiveGroup().forEachObject(function (o) {
                    canvas.sendToBack(o);
                });
            } else {
                canvas.sendToBack(canvas.getActiveObject());
                sendImageBackToEndInGalleryBox(canvas.getActiveObject());
            }
            self.saveCommandHistory('Send to Back');
        };

        /*
         * Move the currently selected image up to the top of the canvas
         */
        self.topFunction = function () {
            if (canvas.getActiveGroup()) {
                    canvas.getActiveGroup().forEachObject(function (o) {
                        canvas.bringToFront(canvas.getActiveObject(o));
                    });
            } else {
                canvas.bringToFront(canvas.getActiveObject());
                sendImageForwardToFrontInGalleryBox(canvas.getActiveObject());
            }
            self.saveCommandHistory('Send to Front');
        };

        /*
         * Move the currently selected image down one layer on the canvas
         */
        self.downFunction = function () {
            if (canvas.getActiveGroup()) {
                canvas.getActiveGroup().forEachObject(function (o) {
                    canvas.sendBackwards(o);
                });
            } else {
                canvas.sendBackwards(canvas.getActiveObject());
                sendImageBackInGalleryBox(canvas.getActiveObject());
            }
            self.saveCommandHistory('1 Layer Back');
        };

    /*
     * Zoom in on the selected image
     * @param zoomOut If true zooms the functions out instead
     */
    self.zoomInFunction = function (zoomOut) {
        var zoomValue = 1.05;
        if (zoomOut) {
            zoomValue = 1 / zoomValue;
        }
        if (canvas.getActiveGroup()) {
            canvas.getActiveGroup().forEachObject(function (object) {

                zoomObjectFunction(object, zoomValue);

                // Once to zoom in on the image, once to get the border change to be picked up
                // Probably a way to do this with one call, but let's hear it for efficiency
                canvas.renderAll();
                positionBtn(object);

                initializeTransformOption(object);
            });
        } else {
            var object = canvas.getActiveObject();
            zoomObjectFunction(object, zoomValue);
            // Once to zoom in on the image, once to get the border change to be picked up
            // Probably a way to do this with one call, but let's hear it for efficiency
            canvas.renderAll();
            positionBtn(object);
            initializeTransformOption();
        }

        if (zoomOut) {
            self.saveCommandHistory('Zoom Out');
        } else {
            self.saveCommandHistory('Zoom In');
        }
    };

    /*
     * Zoom out on the selected image.  Mostly a dummy function to redirect to zoomInFunction
     */
    self.zoomOutFunction = function () {
        self.zoomInFunction(true);
    };

    /**
     * Zooms in on a given object
     * @param object The object to zoom on
     * @param zoomValue The amount of zoom to apply...  A value of 1 corresponds to no zoom.  Higher values mean that
     * the image will be zoomed in
     */
    function zoomObjectFunction(object, zoomValue) {

        var delta;
        // Safeguard against infinity and 0
        if (object.angle % 90 === 0) {
            delta = (object.angle + 0.0005) / 180 * Math.PI;
        } else {
            delta = object.angle / 180 * Math.PI;
        }

        // It works.  That's all I can say about it.
        var x = object.width * object.scaleX,
            y = object.height * object.scaleY,
            sin = Math.sin(delta),
            cos = Math.cos(delta),
            tan = sin / cos;
        var topOffset = x / sin + (y - x / tan) * cos;
        var leftOffset = -1 * (y - x / tan) * sin;

        object.scaleX *= zoomValue;
        object.scaleY *= zoomValue;

        var newTopOffset = zoomValue * topOffset;
        var newLeftOffset = zoomValue * leftOffset;

        object.left -= (newLeftOffset - leftOffset) / 2;
        object.top -= (newTopOffset - topOffset) / 2;

        object.setCoords();
    }

        /**
         * Loads the canvas from a previous location in history
         * @param arrayNumber
         */
        var loadFromTimestamp = function (arrayNumber) {
            var oldCanvas = commandHistory[arrayNumber];
            if (oldCanvas !== null) {
                useTimestampChange = arrayNumber;
                canvas.clear();
                templateSettings.title = "";
                templateSettings.width = "";
                templateSettings.height = "";

                if(oldCanvas.templateTitle !== null)
                {
                    var optionValue = oldCanvas.width + ',' + oldCanvas.height + ',' + oldCanvas.templateTitle;
                    if($("#templateDropdown option[value='"+optionValue+"']").length > 0){
                        $("#templateDropdown").val(optionValue);
                    }
                    else{
                        $("#templateDropdown").val('');
                    }
                }
                else{
                    $("#templateDropdown").val('');
                }

                //Setting canvas width and height back to proper template size.
                if(oldCanvas.canvasHeight !== null && oldCanvas.canvasWidth !== null){
                    canvas.canvasWidth = oldCanvas.canvasWidth;
                    canvas.canvasHeight = oldCanvas.canvasHeight;
                    canvas.templateTitle = oldCanvas.templateTitle;
                }
                if (oldCanvas.lineWidth) {
                    canvas.lineWidth = oldCanvas.lineWidth;
                } else {
                    canvas.lineWidth = 0;
                }
                if (oldCanvas.borderStrokeStyle) {
                    canvas.borderStrokeStyle = oldCanvas.borderStrokeStyle;
                } else {
                    canvas.borderStrokeStyle = '#000000';
                }
                updateFilterCSS();
                canvas.loadFromJSON(oldCanvas, renderFunction);
                btn.style.visibility = 'hidden';
                self.disableToolSetButtons();
            }
        };

        /*
         * Move the currently selected image up one layer on the canvas
         */
        self.upFunction = function () {
            if (canvas.getActiveGroup()) {
                canvas.getActiveGroup().forEachObject(function (o) {
                    canvas.bringForward(o);
                });
            } else {
                canvas.bringForward(canvas.getActiveObject());
                sendImageFowardInGalleryBox(canvas.getActiveObject());
            }
            self.saveCommandHistory('1 Layer Forward');
        };

        /*
         * Creating shortcut for saving canvas
         */
        Mousetrap.bind(['ctrl+s', 'meta+s'], function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                // internet explorer
                e.returnValue = false;
            }
            self.exportAndSaveCanvasFunction("save");
        });

        //Image Size has been changed by transform tool Pressing the enter Key
        $("#imageScale").keyup(function (e) {
            if (e.keyCode === 13) {
                if(canvas.getActiveObject() && imageScaleValue !== $( "#imageScale" ).val()){
                    imageScaleValue = $( "#imageScale" ).val();
                    var object = canvas.getActiveObject();
                    object.originX = "center";
                    object.originY = "center";
                    object.top = object.top + ((object.height*object.scaleY)/2);
                    object.left = object.left + ((object.width*object.scaleX)/2);
                    object.scaleX = ($('#imageScale').val()/100);
                    object.scaleY = ($('#imageScale').val()/100);
                    object.originX = "left";
                    object.originY = "top";
                    object.top = object.top - ((object.height*object.scaleY)/2);
                    object.left = object.left - ((object.width*object.scaleX)/2);
                    object.setCoords();
                    object.setCoords();
                    canvas.renderAll();
                    canvas.renderAll();
                    positionBtn(object);
                    self.saveCommandHistory('Scale Image');
                }
            }
        });

        //Image Rotate has been changed by transform tool Pressing the enter Key
        $("#imageRotate").keyup(function (e) {
            if (e.keyCode === 13) {
                if(canvas.getActiveObject() && imageRotateValue !== $( "#imageRotate" ).val()){
                    imageRotateValue = $( "#imageRotate" ).val();
                    var object = canvas.getActiveObject();
                    object.setAngle($('#imageRotate').val());
                    object.setCoords();
                    canvas.renderAll();
                    self.saveCommandHistory('Rotate Image');
                }
            }
        });

        Mousetrap.bind('up up down down left right left right b a enter', function(e) {
            window.alert("Cha too ma leia kahnkee, ya ee eema loh kah yah lee.\n" +
                "My pee kah soo");
        }, "keyup");
        /**
         * Copies the current image and saves it into a global image
         */
        Mousetrap.bind(['ctrl+c', 'meta+c'], function(e) {

            if (canvas.getActiveObject()) {
                copySingleImageFunction();
            } else {
                copiedImage = null;
            }
        });
        /**
         * Pastes the current image held in the copy image into the canvas, and then clones it again for further pasting
         */
        Mousetrap.bind(['ctrl+v', 'meta+v'], function(e) {
            pasteSingleImageFunction();
        });
        /**
         * Delete the currently selected image or images in the editor
         */
        Mousetrap.bind(['del'], function(e) {
            if(!el){
                if (canvas.getActiveObject() || canvas.getActiveGroup()) {
                    self.removeImages();
                }
            }
        });

        /**
         * Creates an image on the canvas corresponding to the given URL.  Giving a bad URL does not seem to have a negative impact except to throw an error.
         */
        function addImageFromURL(url, firstImage, templateSettings, applyTemplate) {
            if (imageLink === "" || firstImage) {
                imageLink = url;
            }
            applyTemplate = applyTemplate || 0;
            $("#import").removeAttr("disabled");
            $("#backgroundColorPicker").spectrum("enable");
            $('#templateDropdown').prop('disabled',false).removeClass('disabled');
            var fastActionContainer = document.getElementById('fastActionContainerID');
            fastActionContainer.style.pointerEvents = 'auto';
            //Use the FabricJS API to create an image from the given url
            fabric.Image.fromURL(url, function (img) {
                var scaledHeight, scaledWidth;
                if (firstImage === true) {
                    if( $('#projectTitleEditor').val() == ""){
                        self.getProjectTitle(url);
                    }
                    if (img.width > 750 || img.height > 750) {
                        canvas.setWidth(img.width);
                        canvas.setHeight(img.height);
                        canvas.canvasWidth = img.width;
                        canvas.canvasHeight = img.height;
                        canvas.setDimensions({'width': img.width, 'height': img.height}, {'backstoreOnly': true});
                        if(Number(img.width) > Number(img.height)) {
                            scaledHeight = 750.0 / img.width * img.height;
                            canvas.setDimensions({'width': '750px', 'height': scaledHeight + 'px'}, {'cssOnly': true});
                            $(".ui-wrapper").css('width', '750px');
                            $(".ui-wrapper").css('height', scaledHeight + 'px');
                        }
                        else {
                            scaledWidth = 750.0 / img.height * img.width;
                            canvas.setDimensions({'width': scaledWidth + 'px', 'height': '750px'}, {'cssOnly': true});
                            $(".ui-wrapper").css('width', scaledWidth + 'px');
                            $(".ui-wrapper").css('height', '750px');
                        }
                    }
                    else {
                        canvas.setWidth(img.width);
                        canvas.setHeight(img.height);
                        canvas.canvasWidth = img.width;
                        canvas.canvasHeight = img.height;
                        canvas.setDimensions({'width': img.width, 'height': img.height}, {'backstoreOnly': false});
                        $(".ui-wrapper").css('width', img.width);
                        $(".ui-wrapper").css('height', img.height);
                        }
                    }
                    if( templateSettings.width !== "") {
                        canvas.canvasWidth = templateSettings.width;
                        canvas.canvasHeight = templateSettings.height;
                        canvas.setWidth(templateSettings.width);
                        canvas.setHeight(templateSettings.height);
                        if (templateSettings.width > 750 || templateSettings.height > 750) {
                            canvas.setDimensions({'width': templateSettings.width, 'height': templateSettings.height}, {'backstoreOnly': false});
                            if(Number(canvas.width) > Number(canvas.height)) {
                                scaledHeight = 750.0 / canvas.width * canvas.height;
                                canvas.setDimensions({'width': '750px', 'height': scaledHeight + 'px'}, {'cssOnly': true});
                                $(".ui-wrapper").css('width', '750px');
                                $(".ui-wrapper").css('height', scaledHeight + 'px');
                            }
                            else {
                                scaledWidth = 750.0 / canvas.height * canvas.width;
                                canvas.setDimensions({'width': scaledWidth + 'px', 'height': '750px'}, {'cssOnly': true});
                                $(".ui-wrapper").css('width', scaledWidth + 'px');
                                $(".ui-wrapper").css('height', '750px');
                            }
                        }

                        if (templateSettings.title) {
                            canvas.templateTitle = templateSettings.title;
                        }
                    } else{
                        applyTemplate = 0;
                    }
                $("#fade").show();
                // firstImage.php ajax call
                var addImage = img.getSrc();
                var imageTitle = projectTitle || 'blank';
                var data = {
                    'action': 'firstImage',
                    'file': addImage,
                    'firstImage': firstImage,
                    'imageTitle': imageTitle
                };
                $.post(ajaxurl, data, function(msg) {
                    if (msg !== 'false') {
                        var imgTest = new fabric.Image.fromURL(msg, function (newImg) {
                            currentWidth = $('canvas').css("width");
                            currentHeight = $('canvas').css("height");

                            newImg.set({
                                top: 0,
                                left: 0,
                                stroke: '#000000',
                                strokeWidth: 0
                            });
                            if ((newImg.width * newImg.scaleX) > canvas.width || (newImg.height * newImg.scaleY) > canvas.height) {
                                if((newImg.width * newImg.scaleX -canvas.width) >= ((newImg.height * newImg.scaleY) - canvas.height)){
                                    newImg.scaleX = canvas.width/newImg.width;
                                    newImg.scaleY = newImg.scaleX;
                                } else{
                                    newImg.scaleX = canvas.height/newImg.height;
                                    newImg.scaleY = newImg.scaleX;
                                }
                            }
                            canvas.add(newImg);
                            canvas.centerObject(newImg);
                            newImg.setCoords();
                            canvas.renderAll();
                            //Select URL from database and see if it in the database... If not add it to the table
                            if (firstImage === true) {
                                var canvasJSON = JSON.stringify(canvas.toJSON(canvasItems));
                                canvasJSON = canvasJSON.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
                                databaseImageSrc = img.getSrc();
                                var data = {
                                    'action': 'addQuery',
                                    'file': databaseImageSrc,
                                    'jsonInfo': canvasJSON,
                                    'commandHistory': JSON.stringify(commandHistory),
                                    'queryAction': 'select',
                                    'projectTitle': projectTitle
                                };
                                $.post(ajaxurl, data, function(msg) {
                                    getCommandHistory(imageLink, applyTemplate);
                                    commandHistory.clean("");
                                    $("#fade").hide();
                                });
                            } else {
                                addImageRenderList();
                            }
                            // Setting the canvas dimensions display
                            $("span.dimmensionDisplay", "#canvasDimmensionDisplay").text(parseInt(canvas.getWidth()) + " x " + parseInt(canvas.getHeight()));
                        });
                    }
                    else {
                        //Select URL from database and see if it in the database... If not add it to the table
                        if (firstImage === true) {
                            var canvasJSON = JSON.stringify(canvas.toJSON(canvasItems));
                            canvasJSON = canvasJSON.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
                            databaseImageSrc = img.getSrc();
                            if (commandHistory.length < 1) {
                                commandHistory.push("");
                            }
                            var data = {
                                'action': 'addQuery',
                                'file': databaseImageSrc,
                                'jsonInfo': canvasJSON,
                                'commandHistory': JSON.stringify(commandHistory),
                                'queryAction': 'select',
                                'projectTitle': projectTitle
                            };
                            $.post(ajaxurl, data, function(msg) {
                                var finalData = msg.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
                                finalData = finalData.replace(/\\(?!\\n)/g, "");
                                canvas.clear();
                                // Ensure that the border of the canvas is loaded correctly, since this can't be
                                // handled by the renderFunction
                                var obj = JSON.parse(finalData);
                                if (typeof obj.templateTitle === "undefined") {
                                    DWWPSettings.templateTitle = obj.objects[0].templateTitle;
                                } else {
                                    DWWPSettings.templateTitle = obj.templateTitle;
                                }
                                DWWPSettings.templateWidth = obj.canvasWidth;
                                DWWPSettings.templateHeight = obj.canvasHeight;
                                canvas.canvasWidth = obj.canvasWidth;
                                canvas.canvasHeight = obj.canvasHeight;
                                canvas.lineWidth = obj.lineWidth;
                                canvas.borderStrokeStyle = obj.borderStrokeStyle;
                                canvas.templateTitle = obj.templateTitle;
                                canvas.loadFromJSON(finalData, renderAndLoadCommandHistoryFunction);
                            });
                        }
                        else {
                            if ((img.width * img.scaleX) > canvas.width || (img.height * img.scaleY) > canvas.height) {
                                if((img.width * img.scaleX -canvas.width) >= ((img.height * img.scaleY) - canvas.height)){
                                    img.scaleX = canvas.width/img.width;
                                    img.scaleY = img.scaleX;
                                }
                                else{
                                    img.scaleX = canvas.height/img.height;
                                    img.scaleY = img.scaleX;
                                }
                            }
                            img.set({
                                canvasWidth: canvas.getWidth(),
                                canvasHeight: canvas.getHeight(),
                                stroke: '#000000',
                                strokeWidth: 0
                            });
                            canvas.add(img);
                            canvas.centerObject(img);
                            img.setCoords();
                            canvas.renderAll();
                            self.saveCommandHistory('Add Image');
                            $("#fade").hide();
                        }
                        // Setting the canvas dimensions display
                        $("span.dimmensionDisplay", "#canvasDimmensionDisplay").text(parseInt(canvas.getWidth()) + " x " + parseInt(canvas.getHeight()));
                    }
                });
            });
        }

        /**
         * Applies a border to the currently selected image with the given width and color
         */
        self.applyImageBorder = function() {

            var borderWidth = $("#borderImageWidthValue").val();

            if (!borderWidth) {
                canvas.getActiveObject().strokeWidth = 0;
            } else if (borderWidth >= 0) {

                canvas.getActiveObject().strokeWidth = parseInt(borderWidth);

                canvas.renderAll();

            } else {
                window.alert("Please provide a valid value for the border");
            }

            self.saveCommandHistory("Change Image Border Width");

        };

        /**
         * Applies a border to the currently selected image with the given width and color
         */
        self.applyCanvasBorder = function() {

            var borderWidth = parseInt($("#borderCanvasWidthValue").val());

            if (!borderWidth ) {
                canvas.lineWidth = 0;
            } else if (borderWidth >= 0) {

                canvas.lineWidth = borderWidth;

            } else {
                window.alert("Please provide a valid value for the border");
            }

            self.saveCommandHistory("Change Canvas Border Width");
            canvas.renderAll();

        };

        /**
         * Copies a single image that is currently selected and stores it in the global variable copiedImage.  Also adds an offset to the left and right
         */
        function copySingleImageFunction() {
            var newImage = $.extend({}, canvas.getActiveObject());
            copiedImage = {left : newImage.left + 10,
                top : newImage.top + 10,
                image : newImage};
        }

        /**
         * If an image currently exists inside the copiedImage variable, add it to the canvas.  Otherwise do nothing and return quietly.
         */
        function pasteSingleImageFunction() {
            if (copiedImage) {

                var tempImage = copiedImage.image;
                tempImage.left = copiedImage.left;
                tempImage.top = copiedImage.top;

                canvas.add(tempImage);
                canvas.setActiveObject(tempImage);

                // Need to make sure to create a shallow clone of itself so that future pastes don't make references to the same picture
                copiedImage.image = $.extend({}, copiedImage.image);

                // In the event of repeated pasting, continue shifting the image slightly
                copiedImage.left += 10;
                copiedImage.top += 10;
                self.saveCommandHistory('Paste Image');
            }
        }

        function getCommandHistory(image, applyTemplate) {
            applyTemplate = applyTemplate || 0;
            var data = {
                'action': 'getCommandHistory',
                'file': image
            };
            $.post(ajaxurl, data, function(msg) {
                if (msg !== '[]' && msg !== "false" && msg !== " ") {
                    var finalData = msg.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
                    finalData = finalData.replace(/\\(?!\\n)/g, "");
                    fullCommandHistory = JSON.parse(finalData);
                    commandHistory = JSON.parse(finalData);
                }
                else {
                    var canvasJSON = canvas.toJSON(canvasItems);
                    self.saveCommandHistory("Open Image");
                }
                if(applyTemplate !== 0){
                    self.applyTemplateFunction(applyTemplate[0],applyTemplate[1],applyTemplate[2]);
                }
            });
        }

        // JQuery functions.  Set up the needed jquery elements and the functions associated with them and then bind them accordingly
        // Bind an element to an action when clicked
        function createClickListener(element, action, args) {
            element.on("click", function (event) {
                if (args) {
                    action(args);
                }
                else {
                    action();
                }
            });
        }

        // Various JQuery elements that are needed for interaction
        var divButtons = {
            undoTab: function() { return $("#undoTab"); },
            redoTab: function() { return $("#redoTab"); },
            changeCanvasBackgroundButton: function() { return $("#changeCanvasBackground"); },
            sendErrorTab: function() { return $("#sendErrorTab"); }
        };

        /*
         * Prompts the user for a file path to add a new image
         * TODO: Change the prompt to open up a file dialog for the user
         */
        var importFunction = function (fileName) {

            if (!fileName) {
                fileName = window.prompt("Please enter the link to the image you would like to import");
            }
            if (fileName !== null) {
                var uploadURL = DWWPSettings.pathToUpload.path;
                var uploadPath = DWWPSettings.pathToUpload.url;
                var data = {
                    'action': 'import',
                    'file': fileName,
                    'upload': uploadURL
                };
                $.post(ajaxurl, data, function(msg) {
                    var file = fileName.split("/");
                    file = file.pop();
                    uploadPath = uploadPath + '/';
                    var img = uploadPath.concat(file);
                    addImageFromURL(img, false, templateSettings);
                    canvas.renderAll();
                    self.saveCommandHistory('Add Image');
                });
            }
        };
        /*
         * Takes a snapshot of the canvas as a PNG and then displays it to the user in a new window
         */
        self.exportAndViewFunction = function () {
            if (canvas.getActiveObject()) {
                // If the user has an image selected during export deselect it, re-render, take
                // the picture and then reselect and re-render it
                canvas.getActiveObject().active = false;
                canvas.renderAll();
            }
            var screenshot = Canvas2Image.saveAsPNG(context, true);

            $("#previewImageDialog img").attr('src', screenshot.src);
            var dialog = $("#previewImageDialog");
            dialog.css('z-index', 20);
            dialog.parent().find('.ui-dialog-titlebar').removeClass('ui-widget-header');
            var width = parseInt(canvas.width) + 75, height = parseInt(canvas.height) + 75;
            if (width > 1024) {
                width = 1024;
            }
            if (height > 720) {
                height = 720;
            }
            dialog.dialog({
                width: width,
                height: height});
            dialog.dialog('open');

            // Issues with jQuery stemming from changes to the way it is imported
            $('.ui-dialog').css('z-index', 10);
            $('.ui-widget-overlay').css('position', 'fixed');
            // This seems to get jacked up a lot.  If this ends up riding over the dialog, the user's pretty screwed
            $('.ui-widget-overlay').css('z-index', 9);

            if (canvas.getActiveObject()) {
                // If the user has an image selected during export deselect it, re-render, take
                // the picture and then reselect and re-render it
                canvas.getActiveObject().active = true;
                canvas.renderAll();
            }
        };

        /*
         * Takes a snapshot of the canvas as a PNG and passes it along to the export php file
         */
        self.exportAndSaveCanvasFunction = function (action) {
            var projectTitleEditorValue = $('#projectTitleEditor').val();
            if(!projectTitle && (projectTitleEditorValue === "" )){
                window.alert('Please enter a title for the project.');
                return;
            }

            var currentCanvas = model.currentCanvas();
            currentCanvas.title = projectTitleEditorValue;
            model.availableProjects.refresh();
            model.currentCanvas(currentCanvas);

            if (canvas.getActiveObject()) {
                // If the user has an image selected during export deselect it, re-render, take
                // the picture and then reselect and re-render it
                var activeObject = canvas.getActiveObject().id;
            }
            else if(canvas.getActiveGroup()){
                var groupObjects = canvas.getActiveGroup();
            }
            canvas.deactivateAllWithDispatch().renderAll();
            canvas.renderAll();
            var canvasJSON = JSON.stringify(canvas.toJSON(canvasItems));

            canvasJSON = canvasJSON.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
          //  canvasJSON = canvasJSON.replace(/\\n/g, "");
            // Get the canvas screenshot as PNG
            var screenshot = Canvas2Image.saveAsPNG(context, true);
            // Send the screenshot to PHP to save it on the server
            var existingHeight = $('#wpcontent').height();
            $("#fade").css('height', existingHeight + 'px');
            $('#fade').show();
            var data = {
                'action': 'export',
                'postID': postID,
                'base64data': screenshot.src,
                'image': databaseImageSrc,
                'queryAction': action
            };
            $.post(ajaxurl, data, function(msg) {
                var pathURL = msg.split('|');
                databaseImageSrc = pathURL[0];
                if (action === 'copy') {
                    $('#saveBox').fadeIn({duration: 1000}).delay(2000).fadeOut({duration: 1000});
                    if (activeObject !== null) {
                        // If the user has an image selected during export deselect it, re-render, take
                        // the picture and then reselect and re-render it
                        canvas.setActiveObject(canvas.item(activeObject));
                        canvas.renderAll();
                    }
                    else if(groupObjects !== null) {
                        groupObjects = groupObjects._objects;
                        var objects = [];
                        for (var i = 0; i < groupObjects.length; i++) {
                            objects.push(canvas.item(groupObjects[i].id));
                        }
                        canvas.setActiveGroup(new fabric.Group(objects)).renderAll();
                        canvas.renderAll();
                    }
                    //Fix Caching Problems
                    $.ajax({
                        url: imageLink,
                        headers: {
                            "Pragma": "no-cache",
                            "Expires": -1,
                            "Cache-Control": "no-cache"
                        }
                    });
                }
                else {
                    self.saveCommandHistory('Save Image');
                    var testCommand = JSON.stringify(commandHistory);
                    testCommand = testCommand.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
                    //testCommand = testCommand.replace(/\\n/g, "");
                    projectTitle = $('#projectTitleEditor').val();

                    var data = {
                        'action': 'addQuery',
                        'file': databaseImageSrc,
                        'jsonInfo': canvasJSON,
                        'commandHistory': testCommand,
                        'projectTitle': projectTitle,
                        'queryAction': 'update'
                    };

                    $.post(ajaxurl, data, function(msg) {
                        var finalData = msg.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
                        finalData = finalData.replace(/\\(?!\\n)/g, "");
                        canvas.clear();
                        canvas.loadFromJSON(finalData, function() {
                            renderFunction();
                            $('#fade').hide();
                            $('#saveBox').fadeIn({duration: 1000}).delay(2000).fadeOut({duration: 1000});
                            if (activeObject !== undefined) {
                                // If the user has an image selected during export deselect it, re-render, take
                                // the picture and then reselect and re-render it
                                canvas.setActiveObject(canvas.item(activeObject));
                                canvas.renderAll();
                            }
                            else if(groupObjects !== undefined) {
                                groupObjects = groupObjects._objects;
                                var objects = [];
                                for (var i = 0; i < groupObjects.length; i++) {
                                    objects.push(canvas.item(groupObjects[i].id));
                                }
                                canvas.setActiveGroup(new fabric.Group(objects)).renderAll();
                                canvas.renderAll();
                            }
                        });
                        //Fix Caching Problems
                        $.ajax({
                            url: imageLink,
                            headers: {
                                "Pragma": "no-cache",
                                "Expires": -1,
                                "Cache-Control": "no-cache"
                            }
                        });

                    });
                }
            });
        };

        var addImageRenderList = function () {
            renderFunction();
            canvas.renderAll();
            self.saveCommandHistory('Add Image');
            if(templateSettings.title !== ""){
                self.applyTemplateFunction(templateSettings.width,templateSettings.height,templateSettings.title);
            }
        };

        var renderAndLoadCommandHistoryFunction = function () {
            renderFunction();
            getCommandHistory(imageLink,applyTemplate);
            commandHistory.clean("");
        }

        var renderFunction = function () {

            if (canvas.canvasWidth > 750 || canvas.canvasHeight > 750) {
                if(Number(canvas.canvasWidth) > Number(canvas.canvasHeight)) {
                    var scaledHeight = 750.0 / canvas.canvasWidth * canvas.canvasHeight;
                    canvas.setDimensions({'width': '750px', 'height': scaledHeight + 'px'}, {'cssOnly': true});
                } else {
                    var scaledWidth = 750.0 / canvas.canvasHeight * canvas.canvasWidth;
                    canvas.setDimensions({'width': scaledWidth + 'px', 'height': '750px'}, {'cssOnly': true});
                }
                canvas.setDimensions({'width': canvas.canvasWidth, 'height': canvas.canvasHeight}, {'backstoreOnly': true});
            } else {
                canvas.setDimensions({'width': canvas.canvasWidth, 'height': canvas.canvasHeight});
            }

            var optionValue;
            if(canvas.templateTitle !== "") {
                optionValue = canvas.canvasWidth + ',' + canvas.canvasHeight + ',' + canvas.templateTitle;

                if($("#templateDropdown option[value='"+optionValue+"']").length > 0){
                    $("#templateDropdown option[value='"+optionValue+"']").attr('selected', true);
                } else{
                    $("#templateDropdown option[value='']").attr('selected', true);
                }
            }

            // Set the color picker to the color of te background
            $("#backgroundColorPicker").spectrum("set",canvas.backgroundColor);
            if($("#canvasManagementTab .sp-preview-inner")){
                $("#canvasManagementTab .sp-preview-inner").css("background-color",canvas.backgroundColor);
            }
            canvas.renderAll();
            $("span.dimmensionDisplay", "#canvasDimmensionDisplay").text(parseInt(canvas.getWidth()) + " x " + parseInt(canvas.getHeight()));


            var objnum = canvas.getObjects().length;
            var renderIfAll = function () {
                objnum--;
                if (objnum === 0) {
                    canvas.renderAll();
                }
            };

            // This alone is probably a massive slowdown.  Calls to applyFilters are not fast and should be avoided
            // unless necessary
            // TODO: Refactor this out or provide a flag for it
            canvas.forEachObject(function(obj) {
                if (obj.type === 'image' && obj.filters)
                {
                    obj.applyFilters(renderIfAll);
                    filterIsApplied = true;
                }
                else
                {
                    renderIfAll();
                }
            });
            $("#fade").hide();
        };

        var changeCanvasBackgroundFunction = function () {
            canvas.backgroundColor = 'rgba(0,0,255,0.3)';
            canvas.renderAll();
        };

        //Utility functions.  They do exactly what they say.
        function squareSumRoot(x, y) {
            return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        }

        function squareSum(x, y) {
            return ( Math.pow(x, 2) + Math.pow(y, 2) );
        }

        /*
         * @param canvas - The actual canvas element in the document
         * @param width - The new width to adjust the canvas to
         * Adjusts the width of the canvas to the new width
         */
        function setCanvasWidth(canvas, width) {
            canvas.style.width = width;
        }

        /*
         * @param canvas - The actual canvas element in the document
         * @param height - The new height to adjust the canvas to
         * Adjusts the height of the canvas to the new height
         */
        function setCanvasHeight(canvas, height) {
            canvas.style.height = height;
        }


    self.selectExistingProject = function(projectLink) {
        $("#fastActionContainerID").css('display', 'inline-block');
        imageLink = projectLink;
        self.enableToolSetButtons();
        self.getProjectTitle(imageLink);
        applyTemplate = 0;
        addImageFromURL(imageLink, true, templateSettings);
        // Select the project in the project dropdown
        model.selectProject(imageLink);
    };

    /**
     * Try to change to a new project.  If the link to the new project is the same as the current project, then nothing
     * happens.  If there are unsaved changes, offer the user a chance to confirm their choice.
     * @param projectLink GUID of the new project in the database
     * @returns {String} the GUID of the project
     */
    self.trySelectExistingProject = function(projectLink) {
        if (imageLink !== projectLink) {
            var prompted = true;
            if ((commandHistory[commandHistory.length - 1].saveAction !== "Save Image") || !projectTitle ||
                ($('#projectTitleEditor').val() !== projectTitle)) {
                prompted = window.confirm('You have unsaved changes to your project.  Are you sure you want to load ' +
                    'a new project?');
            }

            if (prompted) {
                self.selectExistingProject(projectLink);
                return projectLink;
            }
        }
        return imageLink;
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
                // This will return the selected image from the Media Uploader, the result is an object
                var uploaded_image = image.state().get('selection').first();
                // We convert uploaded_image to a JSON object to make accessing it easier
                var image_url = uploaded_image.toJSON().url;
                // Let's assign the url value to the input field
                $("#newTemplateContainer").slideUp();
                $("#createTemplateTitle").prop('required',false);
                $("#createTemplateWidth").prop('required',false);
                $("#createTemplateHeight").prop('required',false);
                $('#newProjectContainer').css('display', 'none');
                $('#fade').css('height', '850px');
                $('#loading-image').show();
                $('#fade').hide();
                $('#wpfooter').css('margin-top', '0px');
                projectTitle = $('#projectTitle').val();
                var data = {
                    'action': 'createNewFromExistingProject',
                    'url' : image_url,
                    'title' : projectTitle
                };
                // ajaxurl is loaded from digiwidgets-image-editor.php
                $.post(ajaxurl, data, function(ajaxInfo) {
                    model.addProject({guid: ajaxInfo, title: projectTitle});
                    model.selectProject(ajaxInfo);
                    canvas.clear();
                    $('#projectTitleEditor').val("");
                    //Reset parts of the canvas not covered by the clear
                    canvas.backgroundColor = 'transparent';
                    canvas.borderStrokeStyle = "black";
                    canvas.lineWidth = 0;

                    // Wipe the canvas history
                    commandHistory.length = 0;

                    var option = document.getElementById("templateDropdownNewProject").value;
                    if(option && option !== '0,0,Add New Template') {
                        option = option.split(',');
                        templateSettings.width = option[0];
                        templateSettings.height = option[1];
                        templateSettings.title = option[2];
                        applyTemplate = option;
                        addImageFromURL(ajaxInfo, true, templateSettings, option);
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
                            // Check the message coming back from the PHP and make sure the title is the same
                            templateSettings.title = msg;

                            // Get list of templates and then reload dropdown
                            var data = {
                                'action': 'dropdownChoices'
                            };
                            $.post(ajaxurl, data, function(data) {
                                if ($('#templateDropdown').find('option').length > 0) {
                                    $('#templateDropdown').empty();
                                }
                                $('#templateDropdown').append(data);
                                applyTemplate = option;
                                addImageFromURL(ajaxInfo, true, templateSettings, option);
                            });
                        });
                    }
                });
            });
        $('#media-attachment-date-filters').css('width', '200px');
        $("#fastActionContainerID").css('display', 'inline-block');
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

            // Remove the project from the list of projects
            model.removeProject(ajaxInfo);

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

    self.clickNewProject = function() {
        var existingHeight = $('#wpwrap').height();
        $("#fade").css('height', existingHeight + 'px');
        $('#fade').show();
        $('#loading-image').hide();
        var newProjectContainer = document.getElementById("newProjectContainer");
        newProjectContainer.style.visibility = 'visible';
        newProjectContainer.style.display = '';
        $('#projectTitle').val('');
        $('#templateDropdownNewProject').val('');
        $('#templateDropdown').prop('disabled',false).removeClass('disabled');
    };

    self.cancelNewProject = function() {
        $('#fade').hide();
        $('#loading-image').show();
        $("#newTemplateContainer").slideUp();
        $("#createTemplateTitle").val("");
        $("#createTemplateWidth").val("");
        $("#createTemplateHeight").val("");
        $("#createTemplateTitle").prop('required',false);
        $("#createTemplateWidth").prop('required',false);
        $("#createTemplateHeight").prop('required',false);
        var newProjectContainer = document.getElementById("newProjectContainer");
        newProjectContainer.style.visibility = 'hidden';
        model.selectProject(imageLink);
    };

    self.getProjectTitle = function(file) {
            var data = {
                'action': 'getProjectTitle',
                'file' : file
            };
            // ajaxurl is loaded from digiwidgets-image-editor.php
            $.post(ajaxurl, data, function(data) {
                if(!data){
                    projectTitle = $('#projectTitle').val();
                    $('#projectTitleEditor').val(projectTitle);
                } else {
                    $('#projectTitleEditor').val(data);
                    projectTitle = data;
                }
            });
    };

    function clickAddImage() {
        $(window).load(function() {
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
                    // This will return the selected image from the Media Uploader, the result is an object
                    var uploaded_image = image.state().get('selection').first();
                    // We convert uploaded_image to a JSON object to make accessing it easier
                    var image_url = uploaded_image.toJSON().url;
                    // Let's assign the url value to the input field
                    if (imageLink === "") {
                        imageLink = image_url;
                        addImageFromURL(image_url, true, templateSettings);
                    }
                    else {
                        templateSettings.title = "";
                        templateSettings.width = "";
                        templateSettings.height = "";
                        addImageFromURL(image_url, false, templateSettings);
                    }
                    canvas.renderAll();
                });
            $('#media-attachment-date-filters').css('width', '200px');
        });
    }

    //Arrow keys to move selected image moving 1 pixels at a time.
    var isLogged = false;
    //Left Arrow
    Mousetrap.bind('left',function(e) {
        e.preventDefault();
        if ((canvas.getActiveObject()|| canvas.getActiveGroup())) {
            var object1 = (canvas.getActiveObject()?canvas.getActiveObject():canvas.getActiveGroup());
            object1.setLeft(object1.getLeft() - 1);
            object1.setCoords();
            positionBtn(object1);
            if(canvas.getActiveObject()){
                canvas.getActiveObject().active = false;
                canvas.setActiveObject(object1);
            }
            else{
                canvas.getActiveGroup().active = false;
                canvas.setActiveGroup(object1);
            }
            canvas.renderAll();
            isLogged = true;
        }
    },'keydown');
   //Right Arrow
    Mousetrap.bind('right',function(e) {
        e.preventDefault();
        //window.alert();
        if ((canvas.getActiveObject()|| canvas.getActiveGroup())) {
            var object1 = (canvas.getActiveObject()?canvas.getActiveObject():canvas.getActiveGroup());
            object1.setLeft(object1.getLeft() + 1);
            object1.setCoords();
            positionBtn(object1);
            if(canvas.getActiveObject()){
                canvas.getActiveObject().active = false;
                canvas.setActiveObject(object1);
            }
            else{
                canvas.getActiveGroup().active = false;
                canvas.setActiveGroup(object1);
            }
            canvas.renderAll();
            isLogged = true;
        }
    },'keydown');
    //Down Arrow
    Mousetrap.bind('down',function(e) {
        e.preventDefault();
        //window.alert();
        if ((canvas.getActiveObject()|| canvas.getActiveGroup())) {
            var object1 = (canvas.getActiveObject()?canvas.getActiveObject():canvas.getActiveGroup());
            object1.setTop(object1.getTop() + 1);
            object1.setCoords();
            positionBtn(object1);
            if(canvas.getActiveObject()){
                canvas.getActiveObject().active = false;
                canvas.setActiveObject(object1);
            }
            else{
                canvas.getActiveGroup().active = false;
                canvas.setActiveGroup(object1);
            }
            canvas.renderAll();
            isLogged = true;
        }
    },'keydown');
    //Up Arrow
    Mousetrap.bind('up',function(e) {
        e.preventDefault();
        //window.alert();
        if ((canvas.getActiveObject()|| canvas.getActiveGroup())) {
            var object1 = (canvas.getActiveObject()?canvas.getActiveObject():canvas.getActiveGroup());
            object1.setTop(object1.getTop() - 1);
            object1.setCoords();
            positionBtn(object1);
            if(canvas.getActiveObject()){
                canvas.getActiveObject().active = false;
                canvas.setActiveObject(object1);
            }
            else{
                canvas.getActiveGroup().active = false;
                canvas.setActiveGroup(object1);
            }
            canvas.renderAll();
            isLogged = true;
        }
    },'keydown');

    //log move image for everytime kep is up.
    $(document).on('keyup',function keysPressed(evt) {
        if ((evt.keyCode === $.ui.keyCode.LEFT ||
            evt.keyCode === $.ui.keyCode.RIGHT ||
            evt.keyCode === $.ui.keyCode.UP ||
            evt.keyCode === $.ui.keyCode.DOWN) &&
            (canvas.getActiveObject() || canvas.getActiveGroup()) &&
            areObjectsOfType("image") &&
            isLogged
        ) {
            if(!el){
                self.saveCommandHistory('Move Image');
            }
            isLogged = false;
        }
        else if((evt.keyCode === $.ui.keyCode.LEFT ||
            evt.keyCode === $.ui.keyCode.RIGHT ||
            evt.keyCode === $.ui.keyCode.UP ||
            evt.keyCode === $.ui.keyCode.DOWN) &&
            (canvas.getActiveObject() || canvas.getActiveGroup()) &&
            areObjectsOfType("i-text") &&
            isLogged
        ){
            self.saveCommandHistory('Move Text');
            isLogged = false;
        }
        else if(isLogged){
            if(!el){
                self.saveCommandHistory('Move Objects');
            }
            isLogged = false;
        }
    });


    self.disableToolSetButtons = function () {
        $('#zoomInButton').prop('disabled',true).addClass('disabled');
        $('#forwardToolButton').prop('disabled',true).addClass('disabled');
        $('#frontToolButton').prop('disabled',true).addClass('disabled');
        $('#centerToolButton').prop('disabled',true).addClass('disabled');
        $('#flipVToolButton').prop('disabled',true).addClass('disabled');
        $('#zoomOutButton').prop('disabled',true).addClass('disabled');
        $('#backwardToolButton').prop('disabled',true).addClass('disabled');
        $('#backToolButton').prop('disabled',true).addClass('disabled');
        $('#transformToolButton').prop('disabled',true).addClass('disabled');
        $('#flipHToolButton').prop('disabled',true).addClass('disabled');
        $('#cropToolButton').prop('disabled',true).addClass('disabledPromo');
        $('#showFiltersControl').prop('disabled',true).addClass('disabled');
        $('#filter-controls').hide();

        // Bordering can stay open for more stuff than usual, so make sure it's closed in here
        if ($("#borderToolOptions").is(':visible')) {
            $("#borderToolButton").removeClass( "highlightOption" );
            $("#borderToolOptions").toggle();
        }

        if ($("#transformToolOptions").is(':visible')) {
            $("#transformToolButton").removeClass( "highlightOption" );
            $("#transformToolOptions").toggle();
        }

        $('#borderToolButton').prop('disabled',true).addClass('disabled');
        fastAction.style.pointerEvents = 'none';
        if(imageLink !== ""){
            document.getElementById('textButton').style.pointerEvents = 'auto';
        }
    };

    self.enableToolSetButtons = function () {
        var objs = canvas.getActiveGroup();
        var textflag = 0;
        if (objs === null) {
            $('#zoomInButton').prop('disabled',false).removeClass('disabled');
            $('#zoomOutButton').prop('disabled',false).removeClass('disabled');

            $('#forwardToolButton').prop('disabled',false).removeClass('disabled');
            $('#frontToolButton').prop('disabled',false).removeClass('disabled');

            $('#backwardToolButton').prop('disabled',false).removeClass('disabled');
            $('#backToolButton').prop('disabled',false).removeClass('disabled');

            $('#showFiltersControl').prop('disabled',false).removeClass('disabled');
            $('#textButton').prop('disabled',false).removeClass('disabled');
            $('#borderToolButton').prop('disabled',false).removeClass('disabled');

            $('#centerToolButton').prop('disabled',false).removeClass('disabled');
            $('#flipVToolButton').prop('disabled',false).removeClass('disabled');
            $('#transformToolButton').prop('disabled',false).removeClass('disabled');
            $('#flipHToolButton').prop('disabled',false).removeClass('disabled');
        } else {
            self.disableToolSetButtons();
            for(var i=0;objs && i<objs._objects.length;i++) {
                if(objs._objects[i].type !== 'image')
                {
                    textflag=1;
                    break;
                }
            }
            if(textflag === 0) {
                $('#zoomInButton').prop('disabled',false).removeClass('disabled');
                $('#zoomOutButton').prop('disabled',false).removeClass('disabled');
                $('#centerToolButton').prop('disabled',false).removeClass('disabled');
                $('#flipVToolButton').prop('disabled',false).removeClass('disabled');
                $('#flipHToolButton').prop('disabled',false).removeClass('disabled');
            }
        }
        fastAction.style.pointerEvents = 'auto';
        document.getElementById('textButton').style.pointerEvents = 'auto';
    };

    self.buyNow = function() {
        var win = window.open('http://digiwidgets.com/buy-now/', '_blank');
        win.focus();
    };

    var optionCheck = function(){
        var option = document.getElementById("templateDropdown").value;
        if(option) {
            option = option.split(',');
            self.applyTemplateFunction(option[0],option[1],option[2]);
        }
    };

        // Used for testing purposes.  Maintain dynamic references to all globals
        var globals = {
            canvas: function () {
                return canvas;
            },
            context: function () {
                return context;
            },
            divButtons: function () {
                return divButtons;
            },
            el: function () {
                return el;
            },
            lastActive: function () {
                return lastActive;
            },
            tabs: function () {
                return tabs;
            },
            canvasItems: function () {
                return canvasItems;
            },
            model: function() {
                return model;
            }
        };
        $('#saveBox').hide();
        if (imageLink !== "") {
            //Check if we have a changed image
            imageLink = imageLink.replace(/(.*)(-[0-9]+x[0-9]+)\b(.)(.*)/g, "$1$3$4");
            $("#fastActionContainerID").css('display', 'inline-block');
            self.enableToolSetButtons();
            self.enableToolSetButtons();
            if(templateSettings.width == "" || templateSettings.height == "" || templateSettings.title == ""){
                applyTemplate = 0;
            } else{
                applyTemplate = [templateSettings.width,templateSettings.height,templateSettings.title];
            }
            $('#projectTitleEditor').val(projectTitle);
            addImageFromURL(imageLink, true, templateSettings, applyTemplate);
            var data1 = {
                'action': 'dropdownChoices'
            };
            $.post(ajaxurl, data1, function(data) {
                $('#templateDropdownNewProject').append(data);
                $('#templateDropdown').append(data);

                var addNew = $("#templateDropdown option[value='0,0,Add New Template']");
                if (addNew.length > 0) {
                    $(addNew[0]).remove();
                }
                if(projectTitle !== ""){
                    model.addProject({guid: imageLink, title: projectTitle});
                    model.selectProject(imageLink);
                }

                var data2 = {
                    'action': 'getProjectList'
                };
                $.post(ajaxurl, data2, function(data) {
                    eval(data);
                    model.selectProject(imageLink);
                });
            });
        }

        canvas.backgroundColor = 'rgba(0, 0, 0, 0)';
        canvas.renderAll();
        return $.extend({},self,globals);
    })(jQuery, fabric);
