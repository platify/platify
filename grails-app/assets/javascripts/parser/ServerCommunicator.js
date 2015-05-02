/**
 * ServerCommunicator.js
 *
 * ServerCommunicator objects handle all communication with the server for the assay
 * machine output file parser.
 *
 * @author Team SurNorte
 * CSCI-E99
 * May 7, 2015
 */

// URL suffixes
ServerCommunicator.GET_EXPERIMENT_PLATE_IDENTIFIERS_URL_SUFFIX
    = "/experimentalPlateSet/barcodes/";
ServerCommunicator.SAVE_IMPORT_DATA_URL_SUFFIX = "/rawData/save";
ServerCommunicator.SAVE_PARSING_CONFIG_URL_SUFFIX = "/equipment/save";
ServerCommunicator.UPDATE_PARSING_CONFIG_URL_SUFFIX = "/equipment/update/";

// save types
ServerCommunicator.SAVE_NEW = "save new";
ServerCommunicator.SAVE_UPDATE = "save update";

// other constants
ServerCommunicator.CONTENT_TYPE = "application/json; charset=UTF-8";

/**
 * ServerCommunicator objects handle all communication with the server for the assay
 * machine output file parser.
 *
 * @constructor
 */
function ServerCommunicator(hostname) {
    var _self = this;

    if (!hostname){
        throw new ServerCommunicatorError(
                                       ServerCommunicatorError.HOSTNAME_NOT_DEFINED,
                                       hostname,
                                       "initialize a server communicator object");
    }

    this.hostname = hostname;
    this.plateIDArrayCallbacks = [];
    this.importDataSaveCallbacks = [];
    this.parsingConfigSaveCallbacks = [];


    this.getExperimentPlateIDArray = function(experimentID){

        var jqxhr = $.ajax({
            url: _self.hostname
                        + ServerCommunicator.GET_EXPERIMENT_PLATE_IDENTIFIERS_URL_SUFFIX
                        + experimentID,
            type: "POST",
            data: experimentID,
            processData: false,
            contentType: ServerCommunicator.CONTENT_TYPE
        });

        jqxhr.done(_self.handleSuccessPlateIDArrayRequest);
        jqxhr.fail(_self.handleFailurePlateIDArrayRequest);

        return jqxhr;
    };

    this.registerPlateIDArrayCallback = function(callback){
        _self.plateIDArrayCallbacks.push(callback);
    };

    this.clearPlateIDArrayCallbacks = function(){
        _self.plateIDArrayCallbacks = [];
    };

    this.handleSuccessPlateIDArrayRequest = function(data, textStatus, jqXHR){
        var response;

        if (data.error){
            response = new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
                                                   data.error,
                                                   "get experiment plate identifiers");
        } else {
            response = data;
        }

        _self.notifyPlateIDArrayCallbacks(response);
    };

    this.handleFailurePlateIDArrayRequest = function(jqXHR, textStatus, errorThrown){
        var response;

        response = new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
                                               textStatus,
                                               "get experiment plate identifiers");

        _self.notifyPlateIDArrayCallbacks(response);
    };

    this.notifyPlateIDArrayCallbacks = function(response){
        for (var i=0; i<_self.plateIDArrayCallbacks.length; i++){
            _self.plateIDArrayCallbacks[i](response);
        }
    };


    this.saveImportDataToServer = function(importData){

        var jqxhr = $.ajax({
            url: _self.hostname + ServerCommunicator.SAVE_IMPORT_DATA_URL_SUFFIX,
            type: "POST",
            data: JSON.stringify(importData.getJSONImportDataObject()),
            processData: false,
            contentType: ServerCommunicator.CONTENT_TYPE
        });

        jqxhr.done(_self.handleSuccessImportDataSaveRequest);
        jqxhr.fail(_self.handleFailureImportDataSaveRequest);

        return jqxhr;
    };

    this.registerImportDataSaveCallback = function(callback){
        _self.importDataSaveCallbacks.push(callback);
    };

    this.clearImportDataSaveCallbacks = function(){
        _self.importDataSaveCallbacks = [];
    };

    this.handleSuccessImportDataSaveRequest = function(data, textStatus, jqXHR){
        var response;

        if (data.error){
            response = new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
                                                   data.error,
                                                   "save output file data");
        } else {
            response = data;
        }

        _self.notifyImportDataSaveCallbacks(response);
    };

    this.handleFailureImportDataSaveRequest = function(jqXHR, textStatus, errorThrown){
        var response;

        response = new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
                                               textStatus,
                                               "save output file data");

        _self.notifyImportDataSaveCallbacks(response);
    };

    this.notifyImportDataSaveCallbacks = function(response){
        for (var i=0; i<_self.importDataSaveCallbacks.length; i++){
            _self.importDataSaveCallbacks[i](response);
        }
    };

    this.saveParsingConfigToServer = function(parsingConfig, saveType, parsingID){

        var verb;
        var urlSuffix;

        if (saveType === ServerCommunicator.SAVE_NEW){
            verb = "POST";
            urlSuffix = ServerCommunicator.SAVE_PARSING_CONFIG_URL_SUFFIX;
        } else if (saveType === ServerCommunicator.SAVE_UPDATE){
            verb = "PUT";
            urlSuffix = ServerCommunicator.UPDATE_PARSING_CONFIG_URL_SUFFIX + parsingID;
        }

        var jqxhr = $.ajax({
            url: _self.hostname + urlSuffix,
            type: verb,
            data: JSON.stringify(parsingConfig.getJSONObject()),
            processData: false,
            contentType: ServerCommunicator.CONTENT_TYPE
        });

        jqxhr.done(_self.handleSuccessParsingConfigSaveRequest);
        jqxhr.fail(_self.handleFailureParsingConfigSaveRequest);

        return jqxhr;
    };

    this.registerParsingConfigSaveCallback = function(callback){
        _self.parsingConfigSaveCallbacks.push(callback);
    };

    this.clearParsingConfigSaveCallbacks = function(){
        _self.parsingConfigSaveCallbacks = [];
    };

    this.handleSuccessParsingConfigSaveRequest = function(data, textStatus, jqXHR){
        var response;

        if (data.error){
            response = new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
                data.error,
                "save parsing configuration");
        } else {
            response = data;
        }

        _self.notifyParsingConfigSaveCallbacks(response);
    };

    this.handleFailureParsingConfigSaveRequest = function(jqXHR, textStatus, errorThrown){
        var response;

        response = new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
                                               textStatus,
                                               "save parsing configuration");

        _self.notifyParsingConfigSaveCallbacks(response);
    };

    this.notifyParsingConfigSaveCallbacks = function(response){
        for (var i=0; i<_self.parsingConfigSaveCallbacks.length; i++){
            this.parsingConfigSaveCallbacks[i](response);
        }
    };
}


ServerCommunicatorError.HOSTNAME_NOT_DEFINED = "hostname not defined";
ServerCommunicatorError.AJAX_CALL_FAILURE = "ajax failure";
ServerCommunicatorError.SERVER_ERROR = "server error";

/**
 * ServerCommunicatorErrors represent any error that occurs in the process of
 * communicating with the server in the assay machine output file parser.
 * @param type
 * @param descriptor
 * @param attemptedAction
 * @constructor
 */
function ServerCommunicatorError(type, descriptor, attemptedAction){
    this.type = type;
    this.descriptor = descriptor;
    this.attemptedAction = attemptedAction;

    this.getMessage = function(){

        if (this.type === ServerCommunicatorError.HOSTNAME_NOT_DEFINED){
            return "It was not possible to " + this.attemptedAction + " because the " +
                "application hostname is not defined."
        } else if (this.type === ServerCommunicatorError.AJAX_CALL_FAILURE){
            return "There was a problem communicating with the server to "
                + this.attemptedAction + ". Error: " + descriptor;
        } else if (this.type === ServerCommunicatorError.SERVER_ERROR){
            return "There was a problem on the server to " + this.attemptedAction
                + ". Error: " + descriptor;
        }
    }
}




