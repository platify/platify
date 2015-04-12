
<div class="col-sm-3">

	<div id="labelPanel" class="panel panel-info">
		<div class="panel-heading">
			<h4 class="panel-title">Add New Label</h4>
		</div>
		<div class="panel-body">
			<label>Label Level:</label>
            <div class="btn-group" data-toggle="buttons">
                <label class="btn btn-default btn-sm">
                    <input checked="checked" type="radio" id="wellLevel" name="labellevel" value="well"/> well
                </label>
                <label class="btn btn-default btn-sm">
                    <input type="radio" id="plateLevel" name="labellevel" value="plate" /> plate
                </label>
                <label class="btn btn-default btn-sm">
                    <input type="radio" id="plateSetLevel" name="labellevel" value="plate-set" /> plate-set
                </label>
            </div>
            
         <!--    <button type="button" class="btn btn-default btn-sm glyphicon glyphicon-pencil"> -->
	       
	        </button>
            
			<h4>Well Grouping Labels:</h4>
			<button id="addLabelButton" class="btn btn-default btn-sm">Add New Label</button>
			<button id="addDoseStepButton" class="btn btn-default btn-sm">Add Dose Step</button>
			<button id="importCmpListButton" class="btn btn-default  btn-sm ui-state-disabled">Import Compound List</button>
			
			<div class="toggler">
				<div id="addLabelPanel" class="ui-widget-content ui-corner-all">
					<h4>New Label Details:</h4>
					<div>Category:<input type="text" id="newCatValue"/></div>
					<div>Label:<input type="text" id="newLabelValue"/></div>
					<div>Color:<input type="color" id="newColorValue" value="#FFFF00"/></div>
					<hr/>
					<div><button id="addNewLabel">Apply New Label</button><button id="cancelNewLabel">Cancel</button></div>
					<hr/>
					<strong> Select Wells To Apply Labels To:</strong>
					<div> <button id="clearLastSelection">Undo Last Selection</button><button id="clearAllSelection">Clear Selection</button></div>
				</div>
			</div>
			<div class="toggler">
				<div id="addDosePanel" class="ui-widget-content ui-corner-all">
					<h4>New Dose Step:</h4>
					<div>Top Dose:<input type="text" id="topDoseValue"/></div>
					<div>Step Dilution:<input type="text" id="stepDilutionValue"/></div>
					<div># of Replicates:<input type="text" id="replicatesValue" value="1"/></div>
					<div>Top Dose Color:<input type="color" id="tDoseColorValue" value="#FFFF00"/></div>
					<hr/>
					<div><button id="addDoseStep">Apply Dose Step</button><button id="cancelDoseStep">Cancel</button></div>
					<hr/>
					<strong> Select Wells To Apply Labels To:</strong>
					<div> <button id="clearLastSelectionD">Undo Last Selection</button><button id="clearAllSelectionD">Clear Selection</button></div>
				</div>
			</div>
		
			<div id="editLabelDialog" title="New Label Name">
				<input type="text" id="editNewLabelValue"/>
			</div>
			<hr/>
			<div>Plate Barcode:<input type="text" id="barcode"/></div>
			<div>Cell Range Selected:<span id="cellRange"></span></div>
			<hr/>
			<button id="savePlate" class="btn btn-info btn-sm">Save Plate</button>
			<button id="copyPlate" class="btn btn-info btn-sm ui-state-disabled"><g:link controller="experimentalPlateSet" action="create" id="1">Copy Plate</g:link></button>
		</div>
	</div>
	
	<div id="categoryPanel" class="panel panel-info">
		<div class="panel-heading">
			<h4 class="panel-title">Categories</h4>
		</div>
		<div class="panel-body">
			<div id="categoryList"></div>
		</div>
	</div>
</div>

<div class="col-sm-9">
	<div id="gridPanel" class="panel panel-info">
		<div class="panel-heading">
			<h4 class="panel-title">Plate Wells</h4>
		</div>
		<div class="panel-body">
			<div id="myGrid" style="width:100%; height:650px;"></div>
		</div>
	</div>
</div>


<div id="templateVals">${templateInstance}</div>

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
<asset:javascript src="plateEditor/editorAssignLabels.js"/>


