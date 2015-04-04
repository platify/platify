<%@ page import="edu.harvard.capstone.parser.Equipment" %>


    <h2>Create New Template:</h2>
	<div id="gridPanel" style="float:left; width: 70%">
		<div id="myGrid" style="width:100%;height:650px;"></div>
	</div>
	<div id="labelPanel" style="float:right;width:29%;">
		<div>Cell Range Selected:<span id="cellRange"></span></div>
		<hr/>
		<button id="importTemplateValueListBtn" class="ui-state-default ui-corner-all">Import Template Values</button>
		
		<hr/>
		<h4>New Template Value:</h4>
		<div>Template Value:<input type="text" id="newLabelValue"/></div>
		<button id="addTemplateValueBtn">Add New Value</button>
		<hr/>
		<strong><-- Select Wells To Apply Labels To:</strong>
		<div> <button id="clearLastSelection">Undo Last Selection</button><button id="clearAllSelection">Clear Selection</button></div>
		<hr/>
		<div></div>
		<hr/>
		<div>Well Groupings:<span id="wellGroupSpan"></span></div>
	</div>
	
	<button id="saveTemplate">Save Template</button>

    <g:if env="production">
        <!-- Markup to include ONLY when in production -->
        <g:javascript>
            var hostname = "";      
        </g:javascript>
    </g:if>
    <g:else>
        <g:javascript>
            var hostname = "/capstone";       
        </g:javascript> 
    </g:else>

	<asset:javascript src="jquery-ui.js"/>
	<asset:javascript src="jquery.event.drag-2.2.js"/>
	<asset:javascript src="grid/slick.core.js"/>
    <asset:javascript src="grid/slick.grid.js"/>
    <asset:javascript src="grid/slick.autotooltips.js"/>
    <asset:javascript src="grid/slick.cellrangedecorator.js"/>
    <asset:javascript src="grid/slick.cellrangeselector.js"/>
    <asset:javascript src="grid/slick.cellcopymanager.js"/>
    <asset:javascript src="grid/slick.cellselectionmodel.js"/>
    <asset:javascript src="grid/slick.editors.js"/>
    <asset:javascript src="grid/Grid2Merge.js"/>
    <asset:javascript src="plateEditor/editorCreateTemplate.js"/>


