/*global $, ImageFunctions, fabric*/
var _initializeTypography = function() {

    'use strict';
    // load google fonts
    setupTextFonts();

    // load spectrum color picker for text's fill and text's color
    setupTextColor();

    // get Fabric object of canvas
    var canvas = ImageFunctions.canvas();

    // enable the text button if an image has been loaded to canvas.
    // (This prevents user from putting only text on the canvas. Canvas needs to load at least one image once for saving to work)
    canvas.on('object:added', function(o){
        if (o.target.type === 'image'){
            $('#textButton').prop('disabled',false).removeClass('disabled');
        }
    });

    // Allow user to put text inside canvas once the text button is clicked
    $("#textButton").on("click", function(e){
        var textEl = $(this);
        e.preventDefault();
        if (!textEl.hasClass("highlightOption")){
            textEl.addClass("highlightOption");
            canvas.defaultCursor = 'crosshair';
            canvas.on('mouse:down', function(o){
                if (textEl.hasClass("highlightOption")){
                    var pointer = canvas.getPointer(o.e);

                    var text = new fabric.IText('Your Text Here', {
                        left: pointer.x,
                        top : pointer.y,
                        fill: '#000000'
                    });

                    // Track changes made to the text.  Remember the original state when editing begins and then compare
                    // that to the text when editing is finished.
                    text.on("editing:entered", function(e) {
                        this.previousText = this.text;
                    });

                    text.on("editing:exited", function(e) {

                        if (this.previousText && this.previousText !== this.text) {

                            ImageFunctions.saveCommandHistory("Edit Text");
                        }

                        this.previousText = null;
                    });

                    canvas.add(text);
                    canvas.setActiveObject(text);
                    textEl.removeClass("highlightOption");
                    canvas.defaultCursor = 'default';
                    ImageFunctions.saveCommandHistory('Add Text');
                }
            });

        } else{
            textEl.removeClass("highlightOption");
            canvas.defaultCursor = 'default';
        }
    });

    // toggle buttons
    $("#toolbar button").each( function(){
        var control = $(this).data('control');
        switch (control) {
            case 'bold':
                $(this).click(function(e) {
                    var value = getStyleValue('fontWeight');
                    setStyle('fontWeight',(value === 'bold') ? '' : 'bold');
                    ImageFunctions.saveCommandHistory('Bold Text');
                    $(this).toggleClass('active');
                    e.preventDefault();
                });

                break;

            case 'italic':
                $(this).click(function() {
                    var value = getStyleValue('fontStyle');
                    setStyle('fontStyle',(value  === 'italic') ? '' : 'italic');
                    ImageFunctions.saveCommandHistory('Italicize text');
                    $(this).toggleClass('active');
                });

                break;

            case 'underline':
                $(this).click(function() {
                    var value = getStyleValue('textDecoration');
                    if (value.indexOf('underline') > -1){
                        value = value.replace('underline','');
                    }else {
                        value += 'underline';
                    }
                    setStyle('textDecoration', value);
                    ImageFunctions.saveCommandHistory('Underline text');
                    $(this).toggleClass('active');
                });
                break;
        }

    });

    // font dropdown
    $(".font-family-list").on("change", function(){
        var fontFamily = $(this).val();
        setStyle("fontFamily", fontFamily);
        ImageFunctions.saveCommandHistory("Change text's font family");
    });

    $('#font-line-height').change(function() {
            setStyle('lineHeight', $(this).val());
            var object = canvas.getActiveObject() || canvas.getActiveGroup();
            object.setCoords();
            ImageFunctions.saveCommandHistory("Change text line height");
        });

    $('.control-prop').each(function() {
        var control = $(this).data('control');

        switch(control) {
            case 'font-size':
                $(this).change(function() {
                    setStyle('fontSize', parseInt($(this).val(), 10));
                    ImageFunctions.saveCommandHistory("Change text's font size");

                });
                break;
        }

    });


    /*
    * Determine if active object/active group is made up of a specific type (ex: image, i-text)
    *  and return true if it is, false if otherwise
    */
    function areObjectsOfType(objectType){
        if (!canvas.getActiveObject() && !canvas.getActiveGroup()){
            return false;
        }
        var objects = canvas.getActiveGroup();
        if (objects){
            objects = canvas.getActiveGroup();
            var isOfType = true;
            objects.forEachObject(function (object) {
                if (object.type !== objectType) {
                    isOfType = false;
                    return;
                }
            });
            return isOfType;
        }
        else {
            var object = canvas.getActiveObject();
            return object.type === objectType;
        }
    }

    /*
    * Take appropriate actions based on the type of object is selected on the canvas
    * Ex: enable image tools if image is selected or enable text tool is text is select,
    *   disable all tools if both image and text are selected
    * */
    canvas.on('object:selected', function(o) {
        if (areObjectsOfType("image")){
            ImageFunctions.toggleText(false);
        } else if (areObjectsOfType('i-text')) {
            ImageFunctions.disableToolSetButtons();

            // enable text tools
            if (ImageFunctions.toggleText(true)) {
                $('#toolbar .btn, #toolbar input').prop('disabled', false);
                $("#text-fill-color").spectrum("enable");
                $("#text-fill-color").spectrum("set", getStyleValue("fill") || 'rgb(0, 0, 0)');
                $("#text-background-color").spectrum("enable");
                $("#text-background-color").spectrum("set", getStyleValue("backgroundColor") || 'rgba(0,0,0,0)');
            }

            var object;

            if (canvas.getActiveObject()){
                object = canvas.getActiveObject();
                // if text scale has been changed, set text size accordingly and change scale back to 1
                if (object.scaleX !== 1){
                    var newFontSize = object.fontSize * object.scaleX;
                    object.fontSize = parseInt(newFontSize,10);
                    object.scaleX = 1;
                    object.scaleY = 1;
                }

            } else if (canvas.getActiveGroup()){
                object = canvas.getActiveGroup();

                // if text scale has been changed, set text size accordingly and change scale back to 1
                if (getStyleValue("scaleX") !== 1){
                    object.forEachObject(function(obj){
                        if (obj.scaleX !== 1){
                            var newFontSize = obj.fontSize * obj.scaleX;
                            obj.fontSize = parseInt(newFontSize,10);
                            obj.scaleX = 1;
                            obj.scaleY = 1;
                        }
                    });
                }
            }

            // display current values of selected text/texts

            $('#font-size').val(getStyleValue("fontSize"));

            $('#font-family select').val(getStyleValue("fontFamily"));

            if(getStyleValue("textDecoration").indexOf('underline') > -1) {
                $('[data-control="underline"]').addClass('active');
            } else {
                $('[data-control="underline"]').removeClass('active');
            }

            if(getStyleValue('fontWeight') === 'bold') {
                $('[data-control="bold"]').addClass('active');
            } else {
                $('[data-control="bold"]').removeClass('active');
            }

            if(getStyleValue('fontStyle') === 'italic') {
                $('[data-control="italic"]').addClass('active');
            } else {
                $('[data-control="italic"]').removeClass('active');
            }

            $("#font-line-height").val(getStyleValue('lineHeight'));

            object.setCoords();

        } else {
            // disable text tools if image and text are selected
            ImageFunctions.toggleText(false);
        }
    }).on('selection:cleared',function() {
        // prevent text tools to disappear when a new text is inserted
        if (!$("#textButton").hasClass("highlightOption")){
            ImageFunctions.toggleText(false);
        }

        //$('#toolbar .btn:not(.nodis), #toolbar input:not(.nodis)').prop('disabled', true);
        //$("#text-fill-color").spectrum("disable");
        //$("#text-background-color").spectrum("disable");
    });

    // set up boolean values to keep track if an object has been moved, rotated, or scaled
    var isMoved, isRotated, isScaled, listening = false;

    // See https://github.com/kangax/fabric.js/issues/2362
    // When the canvas has stateful set to false, object:modified will not be fired.  Instead, a workaround is needed
    // As such, scaling, moving, and rotating all end when the user releases the mouse, so that is how to trigger
    // the event.  At such time that the above issue is fixed and we update fabricjs, I would advise switching back
    // to the old way, since it seems more stable
    canvas.on('object:scaling', function(o){
        // if text is scaled, update display for text's size accordingly
        // (Notes: only the display for text's size is changing, the text size itself is still the same.
        //    Text size will get changed once user is done with the scaling action. Look in 'object:modified')
        var newFontSize;
        if (areObjectsOfType("i-text")){
            var object = canvas.getActiveObject();
            if (object){
                newFontSize = (object.fontSize * object.scaleX);
                $('#font-size').val(parseInt(newFontSize,10));
            } else {
                var objects = canvas.getActiveGroup();
                newFontSize = getStyleValue("fontSize") * objects.scaleX;
                $('#font-size').val(parseInt(newFontSize,10));
            }
        }

        if(!areObjectsOfType("rect") && !areObjectsOfType("circle")){
            isScaled = true;

            if (!listening) {
                canvas.on('mouse:up', logCanvas);
                listening = true;
            }
        }


    })
        .on('object:moving', function(o){
            if(!areObjectsOfType("rect") && !areObjectsOfType("circle")){
                isMoved = true;

                if (!listening) {
                    canvas.on('mouse:up', logCanvas);
                    listening = true;
                }
            }
        })
        .on('object:rotating', function(o){
            isRotated = true;

            if (!listening) {
                canvas.on('mouse:up', logCanvas);
                listening = true;
            }
        });

    // Update command history and other values once an object/group of objecst has been modified
    function logCanvas() {

        // Update the position of the close button
        var obj = canvas.getActiveObject() || canvas.getActiveGroup();
        if (obj) {
            ImageFunctions.positionBtn(obj);
        }

        listening = false;
        fabric.util.removeListener(fabric.document, 'mouseup', canvas._onMouseUp);

        if (areObjectsOfType("i-text")){
            var object = canvas.getActiveObject();
            var newFontSize;
            if (object){
                // update font size if a text has been scaled and change scale back to 1
                if (isScaled){
                    newFontSize = (object.fontSize * object.scaleX);
                    object.setFontSize(parseInt(newFontSize,10));
                    object.setScaleX(1);
                    object.setScaleY(1);
                    object.setCoords();
                    isScaled = false;
                    ImageFunctions.saveCommandHistory("Change text's size");
                }
            } else {
                // update font size if a group of texts has been scaled and change scalle back to 1
                if (isScaled){
                    var objects = canvas.getActiveGroup();
                    newFontSize = getStyleValue("fontSize") * objects.scaleX;
                    setStyle("fontSize",parseInt(newFontSize,10));
                    objects.setScaleX(1);
                    objects.setScaleY(1);

                    ImageFunctions.saveCommandHistory("Change text's size");
                    isScaled = false;
                }
            }

            if (isMoved){
                ImageFunctions.saveCommandHistory("Move Text");
                isMoved = false;
            }
            if (isRotated){
                ImageFunctions.saveCommandHistory("Rotate Text");
                isRotated = false;
            }
        } else if (areObjectsOfType("image")){
            if (isMoved){
                ImageFunctions.saveCommandHistory("Move Image");
                isMoved = false;
            }
            if (isRotated){
                ImageFunctions.saveCommandHistory("Rotate Image");
                isRotated = false;
            }
            if (isScaled){
                ImageFunctions.saveCommandHistory("Scale Image");
                isScaled = false;
            }

        } else if ( !areObjectsOfType("rect") && !areObjectsOfType("circle") ){
            if (isMoved){
                ImageFunctions.saveCommandHistory("Move Objects");
                isMoved = false;
            }
            if (isRotated){
                ImageFunctions.saveCommandHistory("Rotate Objects");
                isRotated = false;
            }
            if (isScaled){
                ImageFunctions.saveCommandHistory("Scale Objects");
                isScaled = false;
            }

        }
    }

    /*
        Set up SpectrumJS color pickers for both text's fill and text's color
     */
    function setupTextColor(){
        $("#text-fill-color").spectrum({
            color: "",
            showInput: true,
            className: "spectrum-text-fill-color",
            showPalette: true,
            preferredFormat: "rgb",
            move: function (color) {
                setStyle("fill", color.toRgbString());
                ImageFunctions.saveCommandHistory("Change text's fill color");
            },
            palette: [
                ["rgb(0, 0, 0)","rgb(255, 255, 255)", "rgb(255, 0, 255)", "rgb(0, 128, 128)"],
                ["rgb(255, 165, 0)","rgb(0, 255, 0)", "rgb(255, 0, 0)", "rgb(0, 0, 255)"],
                ["rgb(0, 128, 0)","rgb(128, 0, 0)", "rgb(0, 0, 128)", "rgb(128, 128, 0)"],
                ["rgb(192, 0, 0)","rgb(255, 255, 0)", "rgb(128, 128, 128)", "rgb(128, 0, 128)"]
            ]
        });
        $(".spectrum-text-fill-color .sp-cancel").on("click", function(){
            setStyle("fill", $("#text-fill-color").spectrum("get").toRgbString());
            ImageFunctions.saveCommandHistory("Cancel text's fill color");
        });

        $(".spectrum-text-fill-color .sp-choose").remove();

        $("#text-background-color").spectrum({
            color: "",
            showInput: true,
            className: "spectrum-text-background-color",
            showPalette: true,
            preferredFormat: "rgb",
            move: function (color) {
                setStyle("backgroundColor", color.toRgbString());
                ImageFunctions.saveCommandHistory("Change text's background color");
            },
            palette: [
                ["rgb(0, 0, 0)","rgb(255, 255, 255)", "rgb(255, 0, 255)", "rgb(0, 128, 128)"],
                ["rgb(255, 165, 0)","rgb(0, 255, 0)", "rgb(255, 0, 0)", "rgb(0, 0, 255)"],
                ["rgb(0, 128, 0)","rgb(128, 0, 0)", "rgb(0, 0, 128)", "rgb(128, 128, 0)"],
                ["rgb(192, 0, 0)","rgb(255, 255, 0)", "rgb(128, 128, 128)", "rgb(128, 0, 128)"],
                ["rgba(0, 0, 0, 0)"]
            ]
        });
        $(".spectrum-text-background-color .sp-cancel").on("click", function(){
            setStyle("backgroundColor", $("#text-background-color").spectrum("get").toRgbString());
            ImageFunctions.saveCommandHistory("Cancel text's background color");
        });

        $(".spectrum-text-background-color .sp-choose").remove();

    }



    /*
     Determine whether an object or a group of objects are active in the canvas and get the appropriate
     function to change the value of a particular style
     */
    function setStyle(styleName, styleValue) {
        if (!canvas.getActiveObject() && !canvas.getActiveGroup()) {
            return;
        }

        var setObjectStyle, setGroupStyle;
        if (canvas.getActiveObject()){
            setObjectStyle = MakeSetStyleFunction("object");
            setObjectStyle(styleName, styleValue);
        } else {
            setGroupStyle = MakeSetStyleFunction("group");
            setGroupStyle(styleName, styleValue);
        }
    }

    /*
     Given the type (either "object" or "group" to indicate whether an object or a group of objects are active in the canvas)
     in the parameter, this method will return the corresponding function which takes one parameter (styleName)
     and return the value of that styleName
     */
    function MakeSetStyleFunction(type){
        if (type === "object"){
            return function(styleName, styleValue){
                var object = canvas.getActiveObject();
                object[styleName] = styleValue;
                object.setCoords();
                canvas.renderAll();
            };

        }
        if (type === "group"){
            return function(styleName, styleValue){
                var objects = canvas.getActiveGroup();
                objects.forEachObject(function(object){
                    object[styleName] = styleValue;
                    object.setCoords();
                });
                canvas.renderAll();
            };
        }
    }

    /*
     Determine whether an object or a group of objects are active in the canvas and get the appropriate
     function to return the value of a particular style
     */
    function getStyleValue(styleName) {
        if (!canvas.getActiveObject() && !canvas.getActiveGroup()) {
            return;
        }

        var getObjectStyleValue, getGroupStyleValue;
        if (canvas.getActiveObject()){
            getObjectStyleValue = MakeGetStyleValueFunction("object");
            return getObjectStyleValue(styleName);
        } else {
            getGroupStyleValue = MakeGetStyleValueFunction("group");
            return getGroupStyleValue(styleName);
        }
    }

    /*
     Given the type (either "object" or "group" to indicate whether an object or a group of objects are active in the canvas)
     in the parameter, this method will return the corresponding function which takes two parameters (styleName and value)
     and change the value of that styleName
     */
    function MakeGetStyleValueFunction(type){
        if (type === "object"){
            return function(styleName){
                var object = canvas.getActiveObject();
                return object[styleName];
            };
        }
        if (type === "group"){
            return function(styleName){
                var objects = canvas.getActiveGroup();
                var isSet = true;
                var value;
                var defaultValue;
                if (styleName === "fontWeight"){
                    defaultValue = "normal";
                }
                var arr = [];
                objects.forEachObject(function(object){

                    if (object[styleName] === undefined || object[styleName] === "" || object[styleName] === defaultValue){
                        isSet = false;
                        return;
                    } else {
                        value = object[styleName];
                        arr.push(object[styleName]);
                    }
                });

                if (isSet === false){
                    return "";
                }

                var areIdenticalValue = true;
                arr.forEach(function(item){
                    if (arr[0] !== item){
                        areIdenticalValue = false;
                        return;
                    }
                });

                if (areIdenticalValue === false){
                    if (styleName === "fontSize"){
                        return Math.min.apply(Math, arr);
                    }
                    return "";
                } else {
                    return arr[0];
                }
            };
        }

    }

    /*

     */
    function setupTextFonts(){

        var googleFonts =  [
            "Abel",
            "Amatic SC",
            "Arial",
            "Arimo",
            "Arvo",
            "Bevan",
            "Bitter",
            "Black Ops One",
            "Boogaloo",
            "Bree Serif",
            "Calligraffitti",
            "Cantata One",
            "Cardo",
            "Changa One",
            "Cherry Cream Soda",
            "Chewy",
            "Comfortaa",
            "Coming Soon",
            "Covered By Your Grace",
            "Crafty Girls",
            "Crete Round",
            "Crimson Text",
            "Cuprum",
            "Dancing Script",
            "Dosis",
            "Droid Sans",
            "Droid Serif",
            "Francois One",
            "Fredoka One",
            "Gloria Hallelujah",
            "Happy Monkey",
            "Impact",
            "Indie Flower",
            "Josefin Slab",
            "Judson",
            "Kreon",
            "Lato",
            "Leckerli One",
            "Lobster",
            "Lobster Two",
            "Lora",
            "Luckiest Guy",
            "Merriweather",
            "Metamorphous",
            "Montserrat",
            "Noticia Text",
            "Nova Square",
            "Nunito",
            "Old Standard TT",
            "Open Sans",
            "Oswald",
            "Pacifico",
            "Passion One",
            "Patrick Hand",
            "Permanent Marker",
            "Play",
            "Playfair Display",
            "Poiret One",
            "PT Sans",
            "PT Sans Narrow",
            "PT Serif",
            "Raleway",
            "Righteous",
            "Roboto",
            "Roboto Condensed",
            "Rock Salt",
            "Rokkitt",
            "Sanchez",
            "Satisfy",
            "Schoolbell",
            "Shadows Into Light",
            "Source Sans Pro",
            "Special Elite",
            "Squada One",
            "Tangerine",
            "The Girl Next Door",
            "Times New Roman",
            "Ubuntu",
            "Unkempt",
            "Verdana",
            "Vollkorn",
            "Walter Turncoat",
            "Yanone Kaffeesatz"
        ];



        var googleApi = 'http://fonts.googleapis.com/css?family=';
        googleFonts.forEach(function (fontName){
            googleApi = googleApi+fontName.replace(' ','+')+'n4,n7,i4,i7|';
        });

        googleApi = googleApi.substring(0, googleApi.length - 1);
        // $("head").prepend('<link href="'+googleApi+'" rel="stylesheet" type="text/css">');


        googleFonts.forEach(function (fontName){
            $(".font-family-list").append('<option><a style="font-family:'+ fontName +';" data-val="'+ fontName +'" href="#">'+fontName+'</a></option>');
        });
    }

    $("#textOptions").draggable();
};
