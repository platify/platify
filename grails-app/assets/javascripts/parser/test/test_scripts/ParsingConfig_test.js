/**
 * Created by zacharymartin on 5/4/15.
 */

QUnit.module("ParsingConfig", {
    beforeEach: function(){

    },
    afterEach: function(){

    }
});

test("Convert to DTO and back", function(assert){

    for (var i=0; i<20; i++){
        var parsingConfig = TestUtilities.getRandomParsingConfigObject();
        assert.ok(parsingConfig instanceof ParsingConfig);

        var DTO = parsingConfig.getJSONObject();
        var reconstitutedParsingConfig = ParsingConfig.loadParsingConfig(JSON.stringify(DTO));

        assert.ok(reconstitutedParsingConfig instanceof ParsingConfig, "The loadParsingConfig method should have created a ParsingConfig object");
        assert.ok(JSON.stringify(reconstitutedParsingConfig) === JSON.stringify(parsingConfig),
         "A reconstituted ParsingConfig object should contain the same data as the original.");
    }
});