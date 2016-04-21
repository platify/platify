/**
 * Created by rbw on 4/16/16.
 */

var compounds = [];

function setCompoundList() {
    "use strict";
    var newDiv, innerDiv, newLabel, newCheckbox, compound;
    newDiv = document.createElement("div");
    for (compound in compounds) {

//        console.log("id2: " + compounds[compound].id);
//        console.log("name2: " + compounds[compound].name);
        innerDiv = document.createElement("div");

        newCheckbox = document.createElement("input");
        newCheckbox.type = "checkbox";
        newCheckbox.name = compounds[compound].id;
        newCheckbox.value = compounds[compound].id;
        newCheckbox.id = compounds[compound].id;
        newCheckbox.setAttribute("onchange", "getCompoundLocations(this.id, this);");

        newLabel = document.createElement("label");
        newLabel.htmlFor = compounds[compound].id;
        newLabel.appendChild(document.createTextNode(" " + compounds[compound].name));

        innerDiv.appendChild(newCheckbox);
        innerDiv.appendChild(newLabel);
        newDiv.appendChild(innerDiv);

    }
    document.getElementById("compoundList").innerHTML = newDiv.innerHTML;
}


/*jslint browser:true */
/*global $, jQuery, alert*/

// constants
var GRID_HEIGHT = 100;
var GRID_WIDTH = 100;
var CELL_HEIGHT = 35;
var CELL_WIDTH = 85;
var plateModel = {};
var catLegend = {};


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
 * Call to Platify server to get list of compounds.
 */
function fetchCompoundList() {
    "use strict";
    var jqxhr = $.ajax({
        url: hostname + "/plate/getCompounds/",
        type: "POST",
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
function getCompoundLocations(id, obj) {

    "use strict";

    // fetch data
    if (obj.checked == true) {
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

            selectedCompounds.push(obj.id, resData);
        });

        spoofLiquidHandlerLocations();

    } else {

        // delete from existing object
        console.log("deleting existing data");

        delete selectedCompounds[obj.id];

    }

    console.log("selectedCompounds count: " + selectedCompounds.length);
    console.log("selectedCompounds items: " + selectedCompounds);

}

function spoofLiquidHandlerLocations() {
    "use strict";
    var jqxhr = $.ajax({
        url: hostname + "/LiquidHandler/spoofCompoundLocations/",
        type: "POST",
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
//        console.log( "compound location complete" );
//        console.log("templateJson=" + JSON.stringify(resData));
        //loadPlateJsonData(resData);
        //loadCompoundJsonData(JSON.stringify(resData));
        parseCompoundLiquidHandlerLocationJsonData(JSON.stringify(resData));
    });

}

function parseCompoundLiquidHandlerLocationJsonData(jsonData) {
    for (el in jsonData) {
        document.getElementById("lhmappinginstructions").text = JSON.stringify(jsonData);
    }
}


function onViewSelect(clickedEL) {
    "use strict";
    var elValArr, plateId;
    $("#gridView").hide();
    $("#loaderView").show();

    fetchCompoundList();
/*    elValArr = clickedEL.value.split("-");
    plateId = elValArr[0];
    GRID_WIDTH = elValArr[1];
    GRID_HEIGHT = elValArr[2];

    console.log("selectEvent!:" + plateId);
    fetchPlateData(plateId);
    */
    $("#loaderView").hide();

}


/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init() {
//    "use strict";
}

window.onload = init;
