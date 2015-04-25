/**
 * FlashMessenger.js
 *
 *
 * @constructor
 */

FlashMessenger.ERROR = "error";
FlashMessenger.HIGHLIGHT = "highlight";

function FlashMessenger(messageElementID){
    this.messageElementID = messageElementID;
    this.$messageElement = $("#" + messageElementID);
    var _self = this;

    this.showUserMsg = function(typMsg,msg){

        console.log(typMsg + " : " + msg);

        this.$messageElement.addClass("ui-state-"
                        + (typMsg ==="error" ?"error" : "highlight") + " ui-corner-all");
        this.$messageElement.text(msg);
        this.$messageElement.show("fade", {}, 500 ,callBckFadeOut);
    };

    function callBckFadeOut() {
        setTimeout(function() {
            $( "#" + _self.messageElementID + ":visible" ).removeClass().fadeOut();
        }, 5000 );
    }
}