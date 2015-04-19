/**
 * Created by zacharymartin on 4/18/15.
 */


QUnit.module("ImportDataFileGenerator", {
    beforeEach: function(){
        this.wellLevelCategories = ["categoryA", "categoryB"];
        this.importData1 = new ImportData("experiment1", "parsingConfig1");
        this.importData1.plates
    },
    afterEach: function(){

    }
});

function saysHi(name) {
    return "Hi, " + name;
}

test('saysHi()', function() {
    equal(saysHi("Zach"), "Hi, Zach", "function outputs string correctly")

});
