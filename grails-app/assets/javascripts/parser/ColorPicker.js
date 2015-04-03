/**
 * Created by zacharymartin on 3/25/15.
 */

/**
 * An object for picking distinct colors
 * @constructor
 */
function ColorPicker(){
    var colorPointer = 0;
    var colorKeyCounter = 0;

    var distinctColors = [
        '#00FF00',
        '#0000FF',
        '#FF0000',
        '#01FFFE',
        '#FFA6FE',
        '#FFDB66',
        '#006401',
        '#010067',
        '#95003A',
        '#007DB5',
        '#FF00F6',
        '#FFEEE8',
        '#774D00',
        '#90FB92',
        '#0076FF',
        '#D5FF00',
        '#FF937E',
        '#6A826C',
        '#FF029D',
        '#FE8900',
        '#7A4782',
        '#7E2DD2',
        '#85A900',
        '#FF0056',
        '#A42400',
        '#00AE7E',
        '#683D3B',
        '#BDC6FF',
        '#263400',
        '#BDD393',
        '#00B917',
        '#9E008E',
        '#001544',
        '#C28C9F',
        '#FF74A3',
        '#01D0FF',
        '#004754',
        '#E56FFE',
        '#788231',
        '#0E4CA1',
        '#91D0CB',
        '#BE9970',
        '#968AE8',
        '#BB8800',
        '#43002C',
        '#DEFF74',
        '#00FFC6',
        '#FFE502',
        '#620E00',
        '#008F9C',
        '#98FF52',
        '#7544B1',
        '#B500FF',
        '#00FF78',
        '#FF6E41',
        '#005F39',
        '#6B6882',
        '#5FAD4E',
        '#A75740',
        '#A5FFD2',
        '#FFB167',
        '#009BFF',
        '#E85EBE'
    ];

    /**
     * Returns the next distinct color
     * @returns {string}
     */
    this.getNextColor = function(){
        colorPointer = (colorPointer + 1) % distinctColors.length;
        colorkeyCounter++;
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
        colorKeyCounter++;
        return distinctColors[colorPointer];
    };

    /**
     * Returns the current distinct color
     * @returns {string}
     */
    this.getCurrentColor = function(){
        colorKeyCounter++;
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

        colorKeyCounter++;
        return distinctColors[index];
    };

    this.getDistinctColorKey = function(){
        colorKeyCounter++;
        return this.getCurrentColorKey();
    };

    this.getCurrentColorKey = function(){
        return "key" + colorKeyCounter;
    };

    this.resetColorPicker = function(){
        colorPointer = 0;
    };
}