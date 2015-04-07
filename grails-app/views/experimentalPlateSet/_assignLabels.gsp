
<h2>Create Plate: </h2>
<div id="gridPanel" style="float:left; width: 70%">
	<div id="myGrid" style="width:100%;height:650px;"></div>
</div>
<div id="labelPanel" style="float:right;width:29%;">
	<div>Cell Range Selected:<span id="cellRange"></span></div>
	<hr/>
	<div id="tabs-1">
		<ul>
			<li><a href="#tabs-2">Well Grouping</a></li>
			<li><a href="#tabs-3">Plate</a></li>
			<li><a href="#tabs-4">Plate Set</a></li>
		</ul>
		<div id="tabs-2">
			<h4>Well Grouping Labels:</h4>
			<button id="addLabelButton" class="ui-state-default ui-corner-all">Add New Label</button>
			<button id="addDoseStepButton" class="ui-state-default ui-corner-all">Add Dose Step</button>
			<button id="importCmpListButton" class="ui-state-default ui-corner-all">Import Compound List??</button>
			
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
			
			<div id="categoryList"></div>
			
		</div>
		<div id="tabs-3">
			<h4>Plate Level Labels:</h4>
			<p></p>
		</div>
		<div id="tabs-4">
			<h4>Plate Set Labels:</h4>
			<p></p>
		</div>
	</div>
</div>
<div id="editLabelDialog" title="New Label Name">
	<input type="text" id="editNewLabelValue"/>
</div>
<div>Plate Barcode:<input type="text" id="barcode"/></div>
<button id="savePlate">Save Plate</button>
<g:link controller="experimentalPlateSet" action="create" id="1">Copy Plate</g:link>

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


