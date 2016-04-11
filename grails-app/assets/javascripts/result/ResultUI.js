    
function ResultUI(){
	var _self = this;
	//~~~~~~~~~~~~~~~~~~~~~~~~ General Elements ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    var $tabsElement = $("#tabs");
    
    
    // ---------------------- tabs setters and getters -----------------------------------

    this.getActiveTab = function(){
        return $tabsElement.tabs( "option", "active" );
    };

    this.setActiveTab = function(tab){
        $tabsElement.tabs("option", "active", tab);
    };

    
    // ++++++++++++++++++++++++ tabs setup and events ++++++++++++++++++++++++++++++++

    // to get jQuery-UI tab functionality working
    $tabsElement.tabs();
}