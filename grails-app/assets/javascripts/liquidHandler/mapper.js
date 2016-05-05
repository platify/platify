/**
 * Created by rbw on 4/16/16.
 */


// global vars
var compounds = [];
var assays = [];

/**
 * Populate the Assay list dropdown in the modal dialog on "Configure Mapping"
 */
function populateAssayList() {
    assayListSelect = document.getElementById('assayList');

    console.log("starting html insert");

    var assay;
    for (assay in assays) {
        console.log("doing html insert");
        assayListSelect.options[assayListSelect.options.length] = new Option(assays[assay].name, assays[assay].id);
    }
    console.log("endedhtml insert");
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
        console.log("assay list call complete");
        $("#gridView").show();
        var jsonData;

        console.log(JSON.stringify(resData));
        jsonData = JSON.parse(JSON.stringify(resData));

        console.log("assay: " + jsonData.assay[0].name);

        assays = jsonData.assay;

        populateAssayList();
    });
}





// Create the compound list in the DOM
function setCompoundList() {
    "use strict";
    var newDiv, innerDiv, newLabel, newCheckbox, compound;
    newDiv = document.createElement("div");
    for (compound in compounds) {

        innerDiv = document.createElement("div");

        newLabel = document.createElement("label");
        newLabel.htmlFor = compounds[compound].id;
        newLabel.appendChild(document.createTextNode(" " + compounds[compound].name));

        innerDiv.appendChild(newLabel);
        newDiv.appendChild(innerDiv);

    }
    document.getElementById("compoundList").innerHTML = newDiv.innerHTML;

    document.getElementById("getMappingInstructions").hidden = false;
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

    setCompoundList();

}



/**
 * Call to Platify server to get list of compounds from experiment/assay
 */
function fetchAssayCompoundList(selectedAssay) {
    "use strict";
    console.log("calling with value: " + selectedAssay.value);

    $("#gridView").hide();
    $("#loaderView").show();


    var jqxhr = $.ajax({
        url: hostname + "/plate/getCompoundsByAssay/?assayId=" + selectedAssay.value,
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

    $("#gridView").show();
    $("#loaderView").hide();


    // Set another completion function for the request above
    jqxhr.always(function(resData) {
        console.log( "compound complete" );
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
        console.log("templateJson=" + JSON.stringify(resData));
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

        for (var i = 0; i < j.length; i++) {
            var obj = j[i];

            console.log("json: " + JSON.stringify(obj));

            console.log(obj.name);
        }
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
    document.getElementById("lhmappinginstructions").value += "==========================================================";

}

window.onload = init;
