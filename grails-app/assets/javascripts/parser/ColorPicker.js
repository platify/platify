/**
 * ColorPicker.js
 *
 * An object for picking distinct colors
 * @constructor
 *
 * @author Team SurNorte
 * CSCI-E99
 * May 7, 2015
 */
function ColorPicker(){
    ColorPicker.PLATE_COLOR = "#777777";

    var colorPointer = 0;

    var distinctColors = [
        // list of distinct colorblind and print safe colors taken from Paul Tol's
        // web-page http://www.sron.nl/~pault/
        "#882E72", // purple
        "#1965B0", // blue
        "#4EB265", // green
        "#F7EE55", // yellow
        "#E8601C", // orange
        "#DC050C",  // red
        "#B178A6", // light purple
        "#5289C7", // light blue
        "#90C987", // light green
        "#F1932D", // light orange
        "#D6C1DE", // very light purple
        "#7BAFDE", // very light blue
        "#CAE0AB", // greenish yellow
        "#F6C141" // yellowish orange
    ];

    /**
     * Returns the next distinct color
     * @returns {string}
     */
    this.getNextColor = function(){
        colorPointer = (colorPointer + 1) % distinctColors.length;
        return distinctColors[colorPointer];
    };

    /**
     * Returns the previous distinct color
     * @returns {string}
     */
    this.getPreviousColor = function(){
        colorPointer = (colorPointer - 1) % distinctColors.length;
        if (colorPointer < 0){
            colorPointer = colorPointer + distinctColors.length;
        }
        return distinctColors[colorPointer];
    };

    /**
     * Returns the current distinct color
     * @returns {string}
     */
    this.getCurrentColor = function(){
        return distinctColors[colorPointer];
    };

    /**
     * Returns the color at a given index. Wraps around for high indices or negative
     * indices.
     * @param index
     * @returns {string}
     */
    this.getColorByIndex = function(index){
        index = index % distinctColors.length;

        if (index < 0){
            index = index + distinctColors.length;
        }

        return distinctColors[index];
    };

    /**
     * Resets the calling ColorPicker object to the state it is in when it is newly
     * instantiated.
     */
    this.resetColorPicker = function(){
        colorPointer = 0;
    };

    /**
     * Returns the current color index.
     * @returns {number} - the current color index
     */
    this.getColorIndex = function(){
        return colorPointer;
    };

    /**
     * Sets the current color index.
     * @param index - the index to set the color picker to, wraps as necessary.
     */
    this.setColorIndex = function(index){
        colorPointer = (index) % distinctColors.length;
        if (colorPointer < 0){
            colorPointer = colorPointer + distinctColors.length;
        }
    };
}