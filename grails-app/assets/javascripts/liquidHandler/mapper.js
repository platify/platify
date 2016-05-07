/**
 * Created by rbw on 4/16/16.
 */


// global vars
var compounds = [];
var assays = [];
var compoundsObjArray = []; // = new Array();


/**
 * Populate the Assay list dropdown in the modal dialog on "Configure Mapping"
 */
function populateAssayList() {
    assayListSelect = document.getElementById('assayList');

//    console.log("starting html insert");

    var assay;
    for (assay in assays) {
        console.log("doing html insert");
        assayListSelect.options[assayListSelect.options.length] = new Option(assays[assay].name, assays[assay].id);
    }
//    console.log("endedhtml insert");
}

/**
 * Call to Platify server to get list of compounds from experiment/assay
 */
function fetchAssayList() {
    "use strict";
    var jqxhr = $.ajax({
        url: hostname + "/ExperimentalPlateSet/getAssayList",
        type: "GET",
        data: null,
        processData: false,
        contentType: "application/json; charset=UTF-8"
    }).done(function() {
        console.log("success");
    }).fail(function() {
        console.log("error");
        alert("An error has occurred while fetching compound data from the server.");
    }).always(function() {
        console.log("complete");
    });

    // Set another completion function for the request above
    jqxhr.always(function(resData) {
//        console.log("assay list call complete");
        $("#gridView").show();
        var jsonData;

//        console.log(JSON.stringify(resData));
        jsonData = JSON.parse(JSON.stringify(resData));

//        console.log("assay: " + jsonData.assay[0].name);

        assays = jsonData.assay;

        populateAssayList();
    });
}





// Create the compound list in the DOM
function setCompoundList() {
    "use strict";
    var newDiv, innerDiv, newLabel, newCheckbox, compound;
    newDiv = document.createElement("div");


    for (compound in compounds.compound) {

        innerDiv = document.createElement("div");

        newLabel = document.createElement("label");
        newLabel.htmlFor = compounds.compound[compound].id;
        newLabel.appendChild(document.createTextNode(" " + compounds.compound[compound].name));

        innerDiv.appendChild(newLabel);
        newDiv.appendChild(innerDiv);

    }

    document.getElementById("compoundList").innerHTML = newDiv.innerHTML;

//    console.log("compounds: " + JSON.stringify(compounds));

    if (compounds.compound.length == 0) {
        document.getElementById("compoundList").innerHTML = "No compounds available";
        document.getElementById("getMappingInstructions").hidden = true;
    } else {
        document.getElementById("getMappingInstructions").hidden = false;
    }


}



/**
 * Loads a json data structure received from the server and parses for the Compound list
 */
function loadCompoundJsonData(compoundJson) {
    "use strict";

    var compoundModel, jsonData;

    compoundModel = {};

//    console.log(compoundJson);

    jsonData = JSON.parse(compoundJson);

    compounds = jsonData.compound;

    console.log("compound raw: " + JSON.stringify(compounds.compound));

    if (compounds.compound.length == 0) {
        console.log("empty!!!!!!!!!!!");

    }

    compoundsObjArray.push(compounds)

    console.log("Compound length: " + compoundsObjArray[0].compound.length);

    // check if empty object
    if (compoundsObjArray.length == 1) {
        if (compoundsObjArray[0].compound == "") {
            console.log("empty!");
        } else {
            console.log("non empty!");
        }
        console.log("obj: " + compoundsObjArray[0].compound);
    }

    setCompoundList();

}



/**
 * Call to Platify server to get list of compounds from experiment/assay
 */
function fetchAssayCompoundList(selectedAssay) {
    "use strict";
    console.log("calling with value: " + selectedAssay.value);

    document.getElementById("compoundList").innerHTML = "Loading compounds...";


    $("#gridView").hide();
    $("#loaderView").show();


    var jqxhr = $.ajax({
        url: hostname + "/plate/getCompoundsByAssay/?assayId=" + selectedAssay.value,
        type: "GET",
        data: null,
        processData: false,
        contentType: "application/json; charset=UTF-8"
    }).done(function() {
//        console.log("success");
    }).fail(function() {
        console.log("error");
        document.getElementById("compoundList").innerHTML = "Error retrieving compound list.";
        document.getElementById("getMappingInstructions").hidden = true;

    }).always(function() {
//        console.log("complete");
    });

    $("#gridView").show();
    $("#loaderView").hide();


    // Set another completion function for the request above
    jqxhr.done(function(resData) {
//        console.log("templateJson=" + JSON.stringify(resData));
        $("#gridView").show();
        loadCompoundJsonData(JSON.stringify(resData));
    });
}


var selectedCompounds = [];

/**
 * Call to Platify & (spoofed) to Liquid Handler to get location of compounds.
 */
function getMappingInstructions(id, obj) {

    "use strict";

    // fetch data
        var jqxhr = $.ajax({
            url: hostname + "/plate/getCompoundLocations/" + id,
            type: "POST",
            data: null,
            processData: false,
            contentType: "application/json; charset=UTF-8"
        }).done(function () {
            console.log("success");
        }).fail(function () {
            console.log("error");
            alert("An error has occurred while fetching compound data from the server.");
        }).always(function () {
            console.log("complete");
        });

        // Set another completion function for the request above
        jqxhr.always(function (resData) {
            console.log("compound location complete");
//            console.log("templateJson=" + JSON.stringify(resData));
            //loadPlateJsonData(resData);
            //loadCompoundJsonData(JSON.stringify(resData));
            //parseCompoundLocationJsonData(JSON.stringify(resData));

        });

        spoofLiquidHandlerLocations();

}

function spoofLiquidHandlerLocations() {
    "use strict";
    var jqxhr = $.ajax({
        url: hostname + "/LiquidHandler/spoofCompoundLocations/",
        type: "GET",
        data: null,
        processData: false,
        contentType: "application/json; charset=UTF-8"
    }).done(function() {
        console.log("success");
    }).fail(function() {
        console.log("error");
        alert("An error has occurred while fetching compound data from the server.");
    }).always(function() {
        console.log("complete");
    });

    // Set another completion function for the request above
    jqxhr.always(function(resData) {
        console.log( "compound location complete" );
//        console.log("templateJson=" + JSON.stringify(resData));
        //loadPlateJsonData(resData);
        //loadCompoundJsonData(JSON.stringify(resData));
        parseCompoundLiquidHandlerLocationJsonData(JSON.stringify(resData));
    });

}

var globalscopetest = {}

/**
 * Meat and potatoes of algorithm to create LH mapping file
 *
 * Takes inventory Compound data from LH System and tries to map it to plates in the current
 * Assay experiment w/Compounds to give it to the scientist.
 *
 * @param inventoryJsonData
 */
function parseCompoundLiquidHandlerLocationJsonData(inventoryJsonData) {
    console.log("in parse compound func");

    inventoryJsonData = JSON.parse(inventoryJsonData);

    globalscopetest = inventoryJsonData;

    for (var el in inventoryJsonData) {
//        document.getElementById("lhmappinginstructions").value += "hi " + inventoryJsonData[el];

        var j = JSON.parse(inventoryJsonData[el]);

        // assume that the assay has fewer compounds than the LH Inventory, so cycle through them
        var strCompoundsNotFoundMessage = "";

        for (compound in compounds.compound) {

            var CompoundFound = 0;

            for (var i = 0; i < j.length; i++) {
                var obj = j[i];

                var S_CompoundName = ""
                var S_PlateId = ""
                var S_Well = ""
                var S_Dosage = ""
                var D_PlateId = ""
                var D_Well = ""
                var D_Dosage = ""

//                console.log("json: " + JSON.stringify(obj));

                var SrcCompoundName = obj.name.trim();

                // test if we found the compound we're looking for!
                if (SrcCompoundName == compounds.compound[compound].name) {
                    console.log("here it comes2!");
                    console.log("Compound: " + JSON.stringify(compounds.compound[compound]));
                    CompoundFound = 1;


                    for (destination in compounds.compound[compound].destinations) {
                        S_CompoundName = compounds.compound[compound].name;
                        S_PlateId = obj.srcPlateId;
                        S_Well = String.fromCharCode(65 + obj.row) + obj.col;
                        S_Dosage = (obj.concentration / compounds.compound[compound].destinations[destination].dosage).toString() + " " + compounds.compound[compound].destinations[destination].unit;

                        D_PlateId = compounds.compound[compound].destinations[destination].plate;
                        D_Well = compounds.compound[compound].destinations[destination].well;
                        D_Dosage = compounds.compound[compound].destinations[destination].dosage + " " + compounds.compound[compound].destinations[destination].unit;


                        document.getElementById("lhmappinginstructions").value += S_PlateId + ",\t" +
                            S_Well + ",\t" +
                            S_Dosage + ",\t" +
                            D_PlateId + ",\t" +
                            D_Well + ",\t" +
                            D_Dosage + "\n";

                    }

                }

//                console.log(obj.name);
            }

            // Compound not found in Inventory System
            if (CompoundFound == 0) {
                strCompoundsNotFoundMessage += compounds.compound[compound].name + " not found in Inventory System.\n";

            }

        }

    }

    // errors
    if (strCompoundsNotFoundMessage.length > 0) {
        document.getElementById("lhmappinginstructions").value = "Errors:\n " +
            strCompoundsNotFoundMessage + "\n\n" +
            document.getElementById("lhmappinginstructions").value
    }




    console.log("finished parse compound func");
}


// Perform this function when each compound item is selected
function onViewSelect(clickedEL) {
    "use strict";
    var elValArr, plateId;


    // init data to empty
    document.getElementById("compoundList").innerHTML = "";
    document.getElementById("assayList").selectedIndex = 0;
    document.getElementById("getMappingInstructions").hidden = true;

    // init modal values
    document.getElementById("liquidHandlerName").textContent = clickedEL.dataset.name;
    document.getElementById("liquidHandlerInputPlates").textContent = clickedEL.dataset.inputplates;
    document.getElementById("liquidHandlerOutputPlates").textContent = clickedEL.dataset.outputplates;


    $("#gridView").hide();
    $("#loaderView").show();


    /*    elValArr = clickedEL.value.split("-");
        plateId = elValArr[0];
        GRID_WIDTH = elValArr[1];
        GRID_HEIGHT = elValArr[2];

        console.log("selectEvent!:" + plateId);
        fetchPlateData(plateId);
        */
    $("#loaderView").hide();
    $("#gridView").show();

}


/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init() {
//    "use strict";
    fetchAssayList();

    document.getElementById("lhmappinginstructions").value = "Source (S),\tS_Well,\tS_Dosage,\tDestination (D),\tD_Well,\tD_Dosage\n";
    document.getElementById("lhmappinginstructions").value += "==========================================================\n";

}

window.onload = init;
