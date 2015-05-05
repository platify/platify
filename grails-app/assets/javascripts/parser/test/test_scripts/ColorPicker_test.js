/**
 * Created by zacharymartin on 5/5/15.
 */

QUnit.module("ColorPicker", {
    beforeEach: function(){

    },
    afterEach: function(){

    }
});

test("constructor", function(assert){
    var colorPicker = new ColorPicker();

    assert.ok(colorPicker instanceof ColorPicker,
        "The constructor should return a ColorPicker object.");
});

test("get next color", function(assert){
    var colorPicker = new ColorPicker;
    var lastColor = colorPicker.getNextColor();
    assert.ok(TestUtilities.stringIsValidHexColor(lastColor),
        "The function getNextColor should return a hex color string.");

    for (var i=0; i<1000; i++){
        var currentColor = colorPicker.getNextColor();
        assert.ok(TestUtilities.stringIsValidHexColor(currentColor),
            "The function getNextColor should return a hex color string.");
        assert.ok(currentColor != lastColor,
            "The function getNextColor should return a different color from the last one " +
            "it returned.");
        lastColor = currentColor;
    }
});

test("get previous color", function(assert){
    var colorPicker = new ColorPicker;
    var lastColor = colorPicker.getPreviousColor();
    assert.ok(TestUtilities.stringIsValidHexColor(lastColor),
        "The function getNextColor should return a hex color string.");

    for (var i=0; i<1000; i++){
        var currentColor = colorPicker.getPreviousColor();
        assert.ok(TestUtilities.stringIsValidHexColor(currentColor),
            "The function getNextColor should return a hex color string.");
        assert.ok(currentColor != lastColor,
            "The function getNextColor should return a different color from the last one " +
            "it returned.");
        lastColor = currentColor;
    }
});

test("next previous and current color", function(assert){
    var colorPicker = new ColorPicker;
    var currentColor;

    for (var i=0; i<200; i++){
        var iterations = TestUtilities.getRandomInt(1, 20);

        for (var j=0; j<iterations; j++){
            var move = TestUtilities.getRandomInt(0,2);

            if (move === 0) {
                currentColor = colorPicker.getNextColor();
            } else if (move === 1) {
                currentColor = colorPicker.getPreviousColor();
            } else if (move === 2){
                var randomIndex = TestUtilities.getRandomInt(-1000000, 1000000);
                colorPicker.setColorIndex(randomIndex);
                currentColor = colorPicker.getCurrentColor();
            }

            assert.ok(TestUtilities.stringIsValidHexColor(currentColor),
                "The ColorPicker should return a valid hex color string. current color = " + currentColor);

            for (var k=0; k<iterations; k++){
                var moreCurrentColor = colorPicker.getCurrentColor();

                assert.ok(currentColor == moreCurrentColor,
                    "The current color should not change no matter how many times it is "+
                    "called.");
            }
        }
    }
});

test("get color by index", function(assert){
    var indexToColorMap = {};
    var colorPicker = new ColorPicker();

    for (var i = 0; i < 5000; i++){
        var index = TestUtilities.getRandomInt(-10000000, 10000000);
        indexToColorMap[index] = colorPicker.getColorByIndex(index);
        assert.ok(TestUtilities.stringIsValidHexColor(indexToColorMap[index]),
            "The get color by index function should always return a valid hex color " +
            "string.")
    }

    for (index in indexToColorMap){
        assert.equal(colorPicker.getColorByIndex(index), indexToColorMap[index],
            "The get color by index function should always return the same color");
    }
});

test("reset color picker", function(assert){
    var colorPicker = new ColorPicker();
    var baseColor = colorPicker.getCurrentColor();
    var baseIndex = colorPicker.getColorIndex();
    var currentColor, currentIndex;

    assert.ok(TestUtilities.stringIsValidHexColor(baseColor),
        "The base color should be a valid hex color string.");
    assert.ok(typeof baseIndex === "number",
        "The getColorIndex function should return a number.");

    for (var i=0; i<200; i++){
        var iterations = TestUtilities.getRandomInt(1, 20);

        for (var j=0; j<iterations; j++){
            var move = TestUtilities.getRandomInt(0,2);

            if (move === 0) {
                currentColor = colorPicker.getNextColor();
            } else if (move === 1) {
                currentColor = colorPicker.getPreviousColor();
            } else if (move === 2){
                var randomIndex = TestUtilities.getRandomInt(-1000000, 1000000);
                colorPicker.setColorIndex(randomIndex);
                currentColor = colorPicker.getCurrentColor();
            }

            assert.ok(TestUtilities.stringIsValidHexColor(currentColor),
                "The ColorPicker should return a valid hex color string. current color = " + currentColor);

            colorPicker.resetColorPicker();
            currentColor = colorPicker.getCurrentColor();
            currentIndex = colorPicker.getColorIndex();

            assert.ok(TestUtilities.stringIsValidHexColor(currentColor),
                "The base color should be a valid hex color string.");
            assert.ok(typeof currentIndex === "number",
                "The getColorIndex function should return a number.");
            assert.ok(currentColor === baseColor,
                "The ColorPicker reset should return it to the original base color.");
            assert.ok(currentIndex === baseIndex,
                "The ColorPicker reset should return it to the original base index.");
        }
    }
});