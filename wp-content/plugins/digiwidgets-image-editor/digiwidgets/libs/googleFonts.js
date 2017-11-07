
// Some fonts don't have italic versions,
// but the code below just load all versions of all fonts because I didn't have time to check which one has italic version

var WebFontConfig = {
    google: {
        families: [
            "Abel:n4",
            "Amatic SC:n4",
            "Arimo:n4,i4",
            "Arvo:n4,i4",
            "Bevan:n4",
            "Bitter:n4,i4",
            "Black Ops One:n4",
            "Boogaloo:n4",
            "Bree Serif:n4",
            "Calligraffitti:n4",
            "Cantata One:n4",
            "Cardo:n4,i4",
            "Changa One:n4,i4",
            "Cherry Cream Soda:n4",
            "Chewy:n4",
            "Comfortaa:n4,i4",
            "Coming Soon:n4",
            "Covered By Your Grace:n4",
            "Crafty Girls:n4",
            "Crete Round:n4,i4",
            "Crimson Text:n4,i4",
            "Cuprum:n4,i4",
            "Dancing Script:n4",
            "Dosis:n4",
            "Droid Sans:n4",
            "Droid Serif:n4,i4",
            "Francois One:n4",
            "Fredoka One:n4",
            "The Girl Next Door:n4",
            "Gloria Hallelujah:n4",
            "Happy Monkey:n4",
            "Indie Flower:n4",
            "Josefin Slab:n4,i4",
            "Judson:n4,i4",
            "Kreon:n4",
            "Lato:n4,i4",
            "Leckerli One:n4",
            "Lobster:n4",
            "Lobster Two:n4",
            "Lora:n4,i4",
            "Luckiest Guy:n4",
            "Merriweather:n4,i4",
            "Metamorphous:n4",
            "Montserrat:n4",
            "Noticia Text:n4,i4",
            "Nova Square:n4",
            "Nunito:n4",
            "Old Standard TT:n4,i4",
            "Open Sans:n4,i4",
            "Oswald:n4",
            "Pacifico:n4",
            "Passion One:n4",
            "Patrick Hand:n4",
            "Permanent Marker:n4",
            "Play:n4",
            "Playfair Display:n4,i4",
            "Poiret One:n4",
            "PT Sans:n4,i4",
            "PT Sans Narrow:n4",
            "PT Serif:n4,i4",
            "Raleway:n4",
            "Righteous:n4",
            "Roboto:n4,i4",
            "Roboto Condensed:n4,i4",
            "Rock Salt:n4",
            "Rokkitt:n4",
            "Sanchez:n4,i4",
            "Satisfy:n4",
            "Schoolbell:n4",
            "Shadows Into Light:n4",
            "Source Sans Pro:n4,i4",
            "Special Elite:n4",
            "Squada One:n4",
            "Tangerine:n4",
            "Ubuntu:n4,i4",
            "Unkempt:n4",
            "Vollkorn:n4,i4",
            "Walter Turncoat:n4",
            "Yanone Kaffeesatz:n4"
        ] }
};
(function() {
    'use strict';
    var wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
    '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

