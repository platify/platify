/**
 * Created by zacharymartin on 4/28/15.
 */

QUnit.module("ServerCommunicator", {
    beforeEach: function(){

        // create JQuery ajax mock;
        this.ajaxMock = new AJAXMock();
        jQuery.ajax = this.ajaxMock.ajax;

        function AJAXMock (){
            var _self = this;
            _self.options = null;

            _self.ajax = function(param){
                _self.options = param;
                return new JQXHR();
            };

            function JQXHR(){
                var _self = this;
                _self.successCallback = null;
                _self.failureCallback = null;

                _self.done = function(callback){
                    _self.successCallback = callback;

                };
                _self.fail =  function(callback){
                    _self.failureCallback = callback;
                }
            }
        }

    },
    afterEach: function(){

    }
});

test('server communicator construction throws error when hostname not defined', function(assert) {
    var hostname;
    var serverCommunicator;

    // try to construct a server communicator with undefined hostname;
    try {
        serverCommunicator = new ServerCommunicator(hostname);
        assert.ok(false, "constructing a server communicator with undefined hostname" +
        " should throw an error");
    } catch (error){
        assert.ok(error.type === ServerCommunicatorError.HOSTNAME_NOT_DEFINED,
        "A ServerCommunicatorError of type HOSTNAME_NOT_DEFINED should be thrown when " +
        "a ServerCommunicator object is constructed with an undefined hostname");
    }

    // now define hostname and see if an error is thrown

    hostname = "hostname";

    try {
        serverCommunicator = new ServerCommunicator(hostname);
        assert.ok(serverCommunicator, "a server communicator object should have been " +
        "constructed");
    } catch (error){
        assert.ok(false, "an error should not be thrown on server communicator " +
        "construction with a defined hostname");
    }
});

test("register plate ID array callback", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var callback1 = function(response){return response};
    var callback2 = function(response){return response};
    var callback3 = function(response){return response};

    serverCommunicator.registerPlateIDArrayCallback(callback1);
    assert.ok(serverCommunicator.plateIDArrayCallbacks.length === 1,
        "The server communicator's plateIDArrayCallbacks should have been incremented.");
    serverCommunicator.registerPlateIDArrayCallback(callback2);
    assert.ok(serverCommunicator.plateIDArrayCallbacks.length === 2,
        "The server communicator's plateIDArrayCallbacks should have been incremented.");
    serverCommunicator.registerPlateIDArrayCallback(callback3);
    assert.ok(serverCommunicator.plateIDArrayCallbacks.length === 3,
        "The server communicator's plateIDArrayCallbacks should have been incremented.");
});

test("clear plate ID array callbacks", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var callback1 = function(response){return response};
    var callback2 = function(response){return response};
    var callback3 = function(response){return response};

    assert.ok(serverCommunicator.plateIDArrayCallbacks.length === 0,
        "The server communicator's plateIDArrayCallbacks should have 0 elements");

    serverCommunicator.registerPlateIDArrayCallback(callback1);
    serverCommunicator.registerPlateIDArrayCallback(callback2);
    serverCommunicator.registerPlateIDArrayCallback(callback3);
    assert.ok(serverCommunicator.plateIDArrayCallbacks.length === 3,
        "The server communicator's plateIDArrayCallbacks should have 3 elements");

    serverCommunicator.clearPlateIDArrayCallbacks();
    assert.ok(serverCommunicator.plateIDArrayCallbacks.length === 0,
        "The server communicator's plateIDArrayCallbacks should have 0 elements");
});

test("handle success plate ID array request", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var receivedResponses = [];

    var callback1 = function(response){receivedResponses.push(response + 1)};
    var callback2 = function(response){receivedResponses.push(response + 2)};
    var callback3 = function(response){receivedResponses.push(response + 3)};

    serverCommunicator.handleSuccessPlateIDArrayRequest("data", "all good", {test: 123});
    assert.ok(receivedResponses.length === 0, "No callbacks have been registered, so " +
    "received responses should have length 0");

    serverCommunicator.registerPlateIDArrayCallback(callback1);
    serverCommunicator.registerPlateIDArrayCallback(callback2);
    serverCommunicator.registerPlateIDArrayCallback(callback3);

    serverCommunicator.handleSuccessPlateIDArrayRequest("data", "all good", {test: 123});
    assert.deepEqual(receivedResponses, ["data1", "data2", "data3"], "Each registered " +
    "callback should be notified and given the data");

    serverCommunicator.clearPlateIDArrayCallbacks();
    receivedResponses = [];

    var callbackA = function(response){receivedResponses.push(response)};
    var callbackB = function(response){receivedResponses.push(response)};
    var callbackC = function(response){receivedResponses.push(response)};

    serverCommunicator.registerPlateIDArrayCallback(callbackA);
    serverCommunicator.registerPlateIDArrayCallback(callbackB);
    serverCommunicator.registerPlateIDArrayCallback(callbackC);

    serverCommunicator.handleSuccessPlateIDArrayRequest({error: "bad"},
                                                        "not good",
                                                        {test: 123});
    var expectedReceivedResponses = [];
    expectedReceivedResponses.push(
            new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
                                        "bad",
                                        "get experiment plate identifiers")
                                  );
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
            "bad",
            "get experiment plate identifiers")
    );

    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
            "bad",
            "get experiment plate identifiers")
    );

    assert.deepEqual(receivedResponses, expectedReceivedResponses, "There should be " +
    "three received errors");
});

test("handle failure plate ID array request", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var receivedResponses = [];

    var callbackA = function(response){receivedResponses.push(response)};
    var callbackB = function(response){receivedResponses.push(response)};
    var callbackC = function(response){receivedResponses.push(response)};

    serverCommunicator.registerPlateIDArrayCallback(callbackA);
    serverCommunicator.registerPlateIDArrayCallback(callbackB);
    serverCommunicator.registerPlateIDArrayCallback(callbackC);

    var expectedReceivedResponses = [];
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "get experiment plate identifiers")
    );
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "get experiment plate identifiers")
    );

    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "get experiment plate identifiers")
    );

    serverCommunicator.handleFailurePlateIDArrayRequest({test: 123},
                                                        "not good",
                                                        {error: "oops"});

    assert.deepEqual(receivedResponses, expectedReceivedResponses, "There should be " +
    "three received errors");
});


test("Get experiment plate ID array", function(assert){
    for (var i=0; i<10; i++){
        var experimentID = TestUtilities.getRandomInt(0,5);
        var serverCommunicator = new ServerCommunicator("hostname");

        var jqxhr = serverCommunicator.getExperimentPlateIDArray(experimentID);

        var options = this.ajaxMock.options;
        var url = options.url;
        var contentType = options.contentType;
        var data = options.data;
        var processData = options.processData;
        var type = options.type;

        assert.ok(url === "hostname"
        + ServerCommunicator.GET_EXPERIMENT_PLATE_IDENTIFIERS_URL_SUFFIX
        + experimentID, "The url should be correctly specified.");

        assert.ok(contentType === ServerCommunicator.CONTENT_TYPE,
            "The content type should be correctly specified");

        assert.ok(data === experimentID, "The data should be the experiment ID.");

        assert.ok(processData === false, "ProcessData should be false.");

        assert.ok(type === "POST", "Type should be \"POST\"");

        assert.ok(
            jqxhr.successCallback === serverCommunicator.handleSuccessPlateIDArrayRequest,
            "The success callback should be set to handleSuccessPlateIDArrayRequest.");
        assert.ok(
            jqxhr.failureCallback === serverCommunicator.handleFailurePlateIDArrayRequest,
            "The failure callback should be set to handleSuccessPlateIDArrayRequest.");
    }
});

test("register ImportData save callback", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var callback1 = function(response){return response};
    var callback2 = function(response){return response};
    var callback3 = function(response){return response};

    serverCommunicator.registerImportDataSaveCallback(callback1);
    assert.ok(serverCommunicator.importDataSaveCallbacks.length === 1,
        "The server communicator's importDataSaveCallbacks should have been incremented.");
    serverCommunicator.registerImportDataSaveCallback(callback2);
    assert.ok(serverCommunicator.importDataSaveCallbacks.length === 2,
        "The server communicator's importDataSaveCallbacks should have been incremented.");
    serverCommunicator.registerImportDataSaveCallback(callback3);
    assert.ok(serverCommunicator.importDataSaveCallbacks.length === 3,
        "The server communicator's importDataSaveCallbacks should have been incremented.");
});

test("clear ImportData save callbacks", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var callback1 = function(response){return response};
    var callback2 = function(response){return response};
    var callback3 = function(response){return response};

    assert.ok(serverCommunicator.importDataSaveCallbacks.length === 0,
        "The server communicator's importDataSaveCallbacks should have 0 elements");

    serverCommunicator.registerImportDataSaveCallback(callback1);
    serverCommunicator.registerImportDataSaveCallback(callback2);
    serverCommunicator.registerImportDataSaveCallback(callback3);
    assert.ok(serverCommunicator.importDataSaveCallbacks.length === 3,
        "The server communicator's importDataSaveCallbacks should have 3 elements");

    serverCommunicator.clearImportDataSaveCallbacks();
    assert.ok(serverCommunicator.importDataSaveCallbacks.length === 0,
        "The server communicator's importDataSaveCallbacks should have 0 elements");
});

test("handle success ImportData save request", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var receivedResponses = [];

    var callback1 = function(response){receivedResponses.push(response + 1)};
    var callback2 = function(response){receivedResponses.push(response + 2)};
    var callback3 = function(response){receivedResponses.push(response + 3)};

    serverCommunicator.handleSuccessImportDataSaveRequest("data", "all good", {test: 123});
    assert.ok(receivedResponses.length === 0, "No callbacks have been registered, so " +
    "received responses should have length 0");

    serverCommunicator.registerImportDataSaveCallback(callback1);
    serverCommunicator.registerImportDataSaveCallback(callback2);
    serverCommunicator.registerImportDataSaveCallback(callback3);

    serverCommunicator.handleSuccessImportDataSaveRequest("data", "all good", {test: 123});
    assert.deepEqual(receivedResponses, ["data1", "data2", "data3"], "Each registered " +
    "callback should be notified and given the data");

    serverCommunicator.clearImportDataSaveCallbacks();
    receivedResponses = [];

    var callbackA = function(response){receivedResponses.push(response)};
    var callbackB = function(response){receivedResponses.push(response)};
    var callbackC = function(response){receivedResponses.push(response)};

    serverCommunicator.registerImportDataSaveCallback(callbackA);
    serverCommunicator.registerImportDataSaveCallback(callbackB);
    serverCommunicator.registerImportDataSaveCallback(callbackC);

    serverCommunicator.handleSuccessImportDataSaveRequest({error: "bad"},
        "not good",
        {test: 123});
    var expectedReceivedResponses = [];
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
            "bad",
            "save output file data")
    );
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
            "bad",
            "save output file data")
    );

    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
            "bad",
            "save output file data")
    );

    assert.deepEqual(receivedResponses, expectedReceivedResponses, "There should be " +
    "three received errors");
});

test("handle failure ImportData save request", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var receivedResponses = [];

    var callbackA = function(response){receivedResponses.push(response)};
    var callbackB = function(response){receivedResponses.push(response)};
    var callbackC = function(response){receivedResponses.push(response)};

    serverCommunicator.registerImportDataSaveCallback(callbackA);
    serverCommunicator.registerImportDataSaveCallback(callbackB);
    serverCommunicator.registerImportDataSaveCallback(callbackC);

    var expectedReceivedResponses = [];
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "save output file data")
    );
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "save output file data")
    );

    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "save output file data")
    );

    serverCommunicator.handleFailureImportDataSaveRequest({test: 123},
        "not good",
        {error: "oops"});

    assert.deepEqual(receivedResponses, expectedReceivedResponses, "There should be " +
    "three received errors");
});

test("ImportData save", function(assert){
    for (var i=0; i<10; i++){
        var importData = TestUtilities.getRandomImportDataObject();
        var serverCommunicator = new ServerCommunicator("hostname");

        var jqxhr = serverCommunicator.saveImportDataToServer(importData);

        var options = this.ajaxMock.options;
        var url = options.url;
        var contentType = options.contentType;
        var data = options.data;
        var processData = options.processData;
        var type = options.type;

        assert.ok(url === "hostname" + ServerCommunicator.SAVE_IMPORT_DATA_URL_SUFFIX,
            "The url should be correctly specified.");

        assert.ok(contentType === ServerCommunicator.CONTENT_TYPE,
            "The content type should be correctly specified");

        assert.ok(data === JSON.stringify(importData.getJSONImportDataObject()),
            "The data should be the experiment ID.");

        assert.ok(processData === false, "ProcessData should be false.");

        assert.ok(type === "POST", "Type should be \"POST\"");

        assert.ok(
            jqxhr.successCallback === serverCommunicator.handleSuccessImportDataSaveRequest,
            "The success callback should be set to handleSuccessPlateIDArrayRequest.");
        assert.ok(
            jqxhr.failureCallback === serverCommunicator.handleFailureImportDataSaveRequest,
            "The failure callback should be set to handleSuccessPlateIDArrayRequest.");
    }
});

test("register ParsingConfig save callback", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var callback1 = function(response){return response};
    var callback2 = function(response){return response};
    var callback3 = function(response){return response};

    serverCommunicator.registerParsingConfigSaveCallback(callback1);
    assert.ok(serverCommunicator.parsingConfigSaveCallbacks.length === 1,
        "The server communicator's parsingConfigSaveCallbacks should have been incremented.");
    serverCommunicator.registerParsingConfigSaveCallback(callback2);
    assert.ok(serverCommunicator.parsingConfigSaveCallbacks.length === 2,
        "The server communicator's parsingConfigSaveCallbacks should have been incremented.");
    serverCommunicator.registerParsingConfigSaveCallback(callback3);
    assert.ok(serverCommunicator.parsingConfigSaveCallbacks.length === 3,
        "The server communicator's parsingConfigSaveCallbacks should have been incremented.");
});

test("clear ParsingConfig save callbacks", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var callback1 = function(response){return response};
    var callback2 = function(response){return response};
    var callback3 = function(response){return response};

    assert.ok(serverCommunicator.parsingConfigSaveCallbacks.length === 0,
        "The server communicator's parsingConfigSaveCallbacks should have 0 elements");

    serverCommunicator.registerParsingConfigSaveCallback(callback1);
    serverCommunicator.registerParsingConfigSaveCallback(callback2);
    serverCommunicator.registerParsingConfigSaveCallback(callback3);
    assert.ok(serverCommunicator.parsingConfigSaveCallbacks.length === 3,
        "The server communicator's parsingConfigSaveCallbacks should have 3 elements");

    serverCommunicator.clearParsingConfigSaveCallbacks();
    assert.ok(serverCommunicator.parsingConfigSaveCallbacks.length === 0,
        "The server communicator's parsingConfigSaveCallbacks should have 0 elements");
});

test("handle success ParsingConfig save request", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var receivedResponses = [];

    var callback1 = function(response){receivedResponses.push(response + 1)};
    var callback2 = function(response){receivedResponses.push(response + 2)};
    var callback3 = function(response){receivedResponses.push(response + 3)};

    serverCommunicator.handleSuccessParsingConfigSaveRequest("data", "all good", {test: 123});
    assert.ok(receivedResponses.length === 0, "No callbacks have been registered, so " +
    "received responses should have length 0");

    serverCommunicator.registerParsingConfigSaveCallback(callback1);
    serverCommunicator.registerParsingConfigSaveCallback(callback2);
    serverCommunicator.registerParsingConfigSaveCallback(callback3);

    serverCommunicator.handleSuccessParsingConfigSaveRequest("data", "all good", {test: 123});
    assert.deepEqual(receivedResponses, ["data1", "data2", "data3"], "Each registered " +
    "callback should be notified and given the data");

    serverCommunicator.clearParsingConfigSaveCallbacks();
    receivedResponses = [];

    var callbackA = function(response){receivedResponses.push(response)};
    var callbackB = function(response){receivedResponses.push(response)};
    var callbackC = function(response){receivedResponses.push(response)};

    serverCommunicator.registerParsingConfigSaveCallback(callbackA);
    serverCommunicator.registerParsingConfigSaveCallback(callbackB);
    serverCommunicator.registerParsingConfigSaveCallback(callbackC);

    serverCommunicator.handleSuccessParsingConfigSaveRequest({error: "bad"},
        "not good",
        {test: 123});
    var expectedReceivedResponses = [];
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
            "bad",
            "save parsing configuration")
    );
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
            "bad",
            "save parsing configuration")
    );

    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.SERVER_ERROR,
            "bad",
            "save parsing configuration")
    );

    assert.deepEqual(receivedResponses, expectedReceivedResponses, "There should be " +
    "three received errors");
});

test("handle failure ParsingConfig save request", function(assert){
    var serverCommunicator = new ServerCommunicator("hostname");
    var receivedResponses = [];

    var callbackA = function(response){receivedResponses.push(response)};
    var callbackB = function(response){receivedResponses.push(response)};
    var callbackC = function(response){receivedResponses.push(response)};

    serverCommunicator.registerParsingConfigSaveCallback(callbackA);
    serverCommunicator.registerParsingConfigSaveCallback(callbackB);
    serverCommunicator.registerParsingConfigSaveCallback(callbackC);

    var expectedReceivedResponses = [];
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "save parsing configuration")
    );
    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "save parsing configuration")
    );

    expectedReceivedResponses.push(
        new ServerCommunicatorError(ServerCommunicatorError.AJAX_CALL_FAILURE,
            "not good",
            "save parsing configuration")
    );

    serverCommunicator.handleFailureParsingConfigSaveRequest({test: 123},
        "not good",
        {error: "oops"});

    assert.deepEqual(receivedResponses, expectedReceivedResponses, "There should be " +
    "three received errors");
});

test("ParsingConfig save", function(assert){
    for (var i=0; i<10; i++){
        var parsingConfig = new ParsingConfig("name", "machine", "description", "delimiter");
        var parsingID = TestUtilities.getRandomInt(0, 5);
        var serverCommunicator = new ServerCommunicator("hostname");

        var jqxhr = serverCommunicator.(parsingConfig, ServerCommunicator.SAVE_NEW, null);

        var options = this.ajaxMock.options;
        var url = options.url;
        var contentType = options.contentType;
        var data = options.data;
        var processData = options.processData;
        var type = options.type;

        assert.ok(url === "hostname" + ServerCommunicator.SAVE_PARSING_CONFIG_URL_SUFFIX,
            "The url should be correctly specified.");

        assert.ok(contentType === ServerCommunicator.CONTENT_TYPE,
            "The content type should be correctly specified");

        assert.ok(data === JSON.stringify(parsingConfig.getJSONObject()),
            "The data should be the stringified parsing config.");

        assert.ok(processData === false, "ProcessData should be false.");

        assert.ok(type === "POST", "Type should be \"POST\"");

        assert.ok(
            jqxhr.successCallback === serverCommunicator.handleSuccessImportDataSaveRequest,
            "The success callback should be set to handleSuccessPlateIDArrayRequest.");
        assert.ok(
            jqxhr.failureCallback === serverCommunicator.handleFailureImportDataSaveRequest,
            "The failure callback should be set to handleSuccessPlateIDArrayRequest.");


        jqxhr = serverCommunicator.(parsingConfig, ServerCommunicator.SAVE_UPDATE, parsingID);

        options = this.ajaxMock.options;
        url = options.url;
        contentType = options.contentType;
        data = options.data;
        processData = options.processData;
        type = options.type;

        assert.ok(
            url === "hostname" + ServerCommunicator.UPDATE_PARSING_CONFIG_URL_SUFFIX + parsingID,
            "The url should be correctly specified.");

        assert.ok(contentType === ServerCommunicator.CONTENT_TYPE,
            "The content type should be correctly specified");

        assert.ok(data === JSON.stringify(parsingConfig.getJSONObject()),
            "The data should be the stringified parsing config.");

        assert.ok(processData === false, "ProcessData should be false.");

        assert.ok(type === "PUT", "Type should be \"PUT\"");

        assert.ok(
            jqxhr.successCallback === serverCommunicator.handleSuccessImportDataSaveRequest,
            "The success callback should be set to handleSuccessPlateIDArrayRequest.");
        assert.ok(
            jqxhr.failureCallback === serverCommunicator.handleFailureImportDataSaveRequest,
            "The failure callback should be set to handleSuccessPlateIDArrayRequest.");
    }
});

