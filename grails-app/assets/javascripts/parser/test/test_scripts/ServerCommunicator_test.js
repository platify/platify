/**
 * Created by zacharymartin on 4/28/15.
 */

QUnit.module("ImportDataFileGenerator", {
    beforeEach: function(){

        // create JQuery ajax mock;
        jQuery.ajax = function (param){
            this.options = param;

            return function(){
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
        };

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
        console.log(error);
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


test