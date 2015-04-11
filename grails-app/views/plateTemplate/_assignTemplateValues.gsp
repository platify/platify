<%@ page import="edu.harvard.capstone.parser.Equipment" %>

	<div class="col-sm-3">
		<div id="labelPanel" class="panel panel-info">
			<div class="panel-heading">
				<h4 class="panel-title">Add Well Name</h4>
			</div>
			<div class="panel-body ">
				<label>Template Value:</label>
				<input type="text" id="newLabelValue"></input>
				<button id="addTemplateValueBtn" class="btn btn-info">Add New Value</button>
				
				<hr/>
				<label> Select Wells To Apply Labels To:</label>
				<button id="clearLastSelection">Undo Last Selection</button>
				<button id="clearAllSelection">Clear Selection</button>
				
				<hr/>
				<label>Template Name:</label>
				<input type="text" id="templateName"/>
				<button id="saveTemplate"  class="btn btn-info">Save Template and Continue</button>
				
				<hr/>
				<div>Well Groupings:<span id="wellGroupSpan"></span></div>
				<div>Cell Range Selected:<span id="cellRange"></span></div>
				<hr/>
				<button id="importTemplateValueListBtn" class="btn btn-info">
					Import Template Values
				</button>
			</div>
		</div>
	</div>
	
	<div class="col-sm-9">
		<div id="gridPanel" class="panel panel-info">
			<div class="panel-heading">
				<h4 class="panel-title">Plate Layout</h4>
			</div>
			<div class="panel-body">
				<div id="myGrid" style="width:100%; height:650px;"></div>
			</div>
		</div>
	</div>

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
