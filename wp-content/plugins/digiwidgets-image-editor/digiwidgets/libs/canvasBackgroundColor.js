/*global $, ImageFunctions, fabric*/
/**
 * Initializes the spectrum color picker.  This was originally part of the document.ready function.
 * @private
 */
var _initializeSpectrum = function() {
    'use strict';
    var canvas = ImageFunctions.canvas();

    // get current background color of canvas, transparent if no background color is set
    var currentBackgroundColor = canvas.backgroundColor || 'rgba(0,0,0,0)';

    $("#backgroundColorPicker").spectrum({
        color: currentBackgroundColor,
        showInput: true,
        className: "spectrum-canvas-background-color",
        showPalette: true,
        showSelectionPalette: true,
        maxSelectionSize: 10,
        preferredFormat: "rgb",
        localStorageKey: "spectrum.demo",
        clickoutFiresChange: true,
        move: function (color) {
            // background color changes when a color is picked
            canvas.backgroundColor = color.toRgbString();
            ImageFunctions.saveCommandHistory("Change Background Color");
            canvas.renderAll();

        },
        palette: [
            ["rgba(0, 0, 0, 0)", "rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
                "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"],
            ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
                "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
            ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
                "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
                "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
                "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
                "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
                "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
                "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
                "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
                "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
                "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
        ]
    });

    var oldImageBorder;
    $("#borderImageStyleValue").spectrum({
        color: "black",
        showInput: true,
        className: "borderImageSpectrum",
        showPalette: true,
        showSelectionPalette: true,
        maxSelectionSize: 10,
        preferredFormat: "rgb",
        localStorageKey: "spectrum.demo",
        clickoutFiresChange: true,
        show: function(color) {
            oldImageBorder = color.toRgbString();
        },
        change: function(color) {
            canvas.getActiveObject().stroke = color.toRgbString();
            canvas.renderAll();
        },
        hide: function(color) {

            if (oldImageBorder !== color.toRgbString()) {
                canvas.getActiveObject().stroke = color.toRgbString();
                canvas.renderAll();
                ImageFunctions.saveCommandHistory("Change Image Border Color");
            }
        },
        palette: [
            ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
                "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"],
            ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
                "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
            ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
                "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
                "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
                "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
                "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
                "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
                "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
                "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
                "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
                "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
        ]
    });

    var oldCanvasBorder;
    $("#borderCanvasStyleValue").spectrum({
        color: "black",
        showInput: true,
        className: "borderCanvasSpectrum",
        showPalette: true,
        showSelectionPalette: true,
        maxSelectionSize: 10,
        preferredFormat: "rgb",
        localStorageKey: "spectrum.demo",
        clickoutFiresChange: true,
        show: function(color) {
            oldCanvasBorder = color.toRgbString();
        },
        change: function(color) {
            canvas.borderStrokeStyle = color.toRgbString();
            canvas.renderAll();
        },
        hide: function(color) {

            if (oldCanvasBorder !== color.toRgbString()) {
                canvas.borderStrokeStyle = color.toRgbString();
                canvas.renderAll();
                ImageFunctions.saveCommandHistory("Change Canvas Border Color");
            }
        },
        palette: [
            ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
                "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"],
            ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
                "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
            ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
                "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
                "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
                "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
                "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
                "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
                "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
                "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
                "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
                "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
        ]
    });

    $(".borderImageSpectrum .sp-cancel").on("click", function() {
        canvas.getActiveObject().stroke = oldImageBorder;
        $(this).spectrum('set', oldImageBorder);
        canvas.renderAll();
    });

    $(".borderCanvasSpectrum .sp-cancel").on("click", function() {
        canvas.borderStrokeStyle = oldCanvasBorder;
        $(this).spectrum('set', oldCanvasBorder);
        canvas.renderAll();
    });

    // Booo who wants choose buttons for the spectrum thing
    $(".borderImageSpectrum .sp-choose").remove();
    $(".borderCanvasSpectrum .sp-choose").remove();
    $(".borderImageSpectrum").prop('title',"Image Border Color");
    $(".borderCanvasSpectrum").prop('title',"Canvas Border Color");

    $(".spectrum-canvas-background-color .sp-cancel").on("click", function(){
        // change background color back if cancel button is clicked.
        canvas.backgroundColor = $("#backgroundColorPicker").spectrum("get").toRgbString();
        canvas.renderAll();
        ImageFunctions.saveCommandHistory("Change background color");
    });

    // remove SpectrumJS's default "Choose" button
    $(".spectrum-canvas-background-color .sp-choose").remove();

    $("#tint-color").spectrum({
        color: "",
        showInput: true,
        allowEmpty:true,
        disabled: true,
        preferredFormat: "rgb"
    });
    $("#multiply-color").spectrum({
        color: "",
        showInput: true,
        allowEmpty:true,
        disabled: true,
        preferredFormat: "rgb"
    });
    $("#blend-color").spectrum({
        color: "",
        showInput: true,
        allowEmpty:true,
        disabled: true,
        preferredFormat: "rgb"
    });
};


