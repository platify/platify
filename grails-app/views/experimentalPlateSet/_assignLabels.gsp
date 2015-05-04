
<div class="col-xs-8">
	<div id="labelPanel" class="panel panel-default">
		<div class="panel-heading">
			<div class="panel-title">Add New Label: 
				<span class="pull-right">
					<label>Type:</label>
					<div class="btn-group" data-toggle="buttons">
		                <label class="btn btn-default btn-xs active">
		                    <input type="radio" name="labeltype" id="catLabType"/>Well Label
		                </label>
		                <label class="btn btn-default btn-xs">
		                    <input type="radio" name="labeltype" id="doseLabType"/>Dose
		                </label>
		                <label class="btn btn-default btn-xs">
		                    <input type="radio" name="labeltype" id="doseStepLabType"/>Dose Step
		                </label>
		                <label class="btn btn-default btn-xs">
		                    <input type="radio" name="labeltype" id="plateLabType"/>Plate Label
		                </label>
		                <!-- <label class="btn btn-default btn-xs">
		                    <input type="radio" name="labeltype" id="plateSetLevel"/> Plate-Set
		                </label> -->
		            </div>
				</span>
            </div>
		</div>
		<div class="panel-body" style="padding:7px">
            <div class="toggler">
	            <div id="addLabelPanel">
	            	<div class="row">
			            <label for="newCatValue" class="col-xs-1 control-label">Category:</label>
			            <div class="col-xs-3">
			            	<input type="text" id="newCatValue" class="input-sm form-control"/>
			            </div>
						<label for="newLabelValue" class="col-xs-1 control-label">Label:</label>
						<div class="col-xs-3">
							<input type="text" id="newLabelValue" class="input-sm form-control"/>
						</div>
						<label for="newColorValue" class="col-xs-1 control-label">Color:</label>
						<div class="col-xs-3">
							<div class="input-group">
								<input type="color" class="btn-default glyphicon color-p" id="newColorValue" value="#FFFF00"/>
								<button id="addNewLabel" class="btn btn-default btn-xs glyphicon glyphicon-plus"></button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="toggler">
				<div id="addDosePanel">
					<div class="row">
			            <label for="newDoseValue" class="col-xs-1 control-label">Dosage:</label>
			            <div class="col-xs-3">
			            	<input type="text" id="newDoseValue" class="input-sm form-control"/>
			            </div>
						<label for="newDoseUnits" class="col-xs-1 control-label">Units:</label>
						<div class="col-xs-3">
							<input type="text" id="newDoseUnits" class="input-sm form-control"/>
						</div>
						<label for="newDoseColorValue" class="col-xs-1 control-label">Color:</label>
						<div class="col-xs-3">
							<div class="input-group">
								<input type="color" class="btn-default glyphicon color-p" id="newDoseColorValue" value="#FFFF00"/>
								<button id="addNewDose" class="btn btn-default btn-xs glyphicon glyphicon-plus"></button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="toggler">
				<div id="addDoseStepPanel">
					<div class="row">
			            <label for="topDoseValue" class="col-xs-1 control-label" style="padding-right:0px; text-align: right">Top Dose:</label>
			            <div class="col-xs-1" style="padding:0px">
			            	<input type="text" id="topDoseValue" class="input-sm form-control"/>
			            </div>
						<label for="doseStepUnits" class="col-xs-1 control-label" style="padding:0px; text-align: right">Units:</label>
						<div class="col-xs-2" style="padding:0px">
							<input type="text" id="doseStepUnits" class="input-sm form-control"/>
						</div>
						<label for="stepDilutionValue" class="col-xs-1 control-label" style="padding:0px; text-align: right">Step Dilution:</label>
						<div class="col-xs-1" style="padding:0px">
							<input type="text" id="stepDilutionValue" class="input-sm form-control"/>
						</div>
						<label for="replicatesValue" class="col-xs-1 control-label" style="padding:0px; text-align: right">Replicates:</label>
						<div class="col-xs-1" style="padding:0px">
							<input type="text" id="replicatesValue" class="input-sm form-control" value="0"/>		<!-- Add spinner ?? -->
						</div>
						<label for="tDoseColorValue" class="col-xs-1 control-label" style="padding:0px; text-align: right">Top Dose Color:</label>
						<div class="col-xs-2" style="padding:0px">
							<div class="input-group" style="padding:0px">
								<input type="color" class="btn-default glyphicon color-p" id="tDoseColorValue" value="#FFFF00"/>
								<button id="addDoseStep" class="btn btn-default btn-xs glyphicon glyphicon-plus"></button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="toggler">
				<div id="addPlateLabelPanel">
	            	<div class="row">
			            <label for="newPlateCatValue" class="col-xs-1 control-label">Category:</label>
			            <div class="col-xs-4">
			            	<input type="text" id="newPlateCatValue" class="input-sm form-control"/>
			            </div>
						<label for="newPlateLabelValue" class="col-xs-1 control-label">Label:</label>
						<div class="col-xs-4">
							<input type="text" id="newPlateLabelValue" class="input-sm form-control"/>
						</div>
						<div class="col-xs-1">
							<button id="addNewPlateLabel" class="btn btn-default btn-xs glyphicon glyphicon-plus"></button>
						</div>
					</div>
				</div>				
			</div>
		</div>
	</div>

	<div id="gridPanel" class="panel panel-default">
		<div class="panel-heading">
			<h4 class="panel-title">Plate Wells:<span class="pull-right"><button id="clearAllSelection" class="btn btn-info btn-xs">Clear Selection</button></span></h4>
		</div>
		<div class="panel-body" style="padding:0px">
			<div id="myGrid" style="width:100%; height:650px;"></div>
		</div>
	</div>
</div>

<div class="col-xs-2">
	<div class="toggler">
		<div id="categoryPanel" class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">Well Labels</h4>
			</div>
			<div class="panel-body">
				<div id="categoryList"></div>
			</div>
		</div>
	</div>
	
	<div class="toggler">
		<div id="plateLabelCatPanel" class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">Plate Labels</h4>
			</div>
			<div class="panel-body">
				<div id="plateLabelList"></div>
			</div>
		</div>
	</div>
</div>

<div class="col-xs-2">
	<div id="compoundPanel" class="panel panel-default">
		<div class="panel-heading">
			<h4 class="panel-title">Compounds<span class="pull-right"><button id="importCompoundListButton" type="button" class="btn btn-info btn-xs glyphicon glyphicon-import" data-toggle="modal" data-target="#importCompoundsModal"></button></span></h4>
		</div>
		<div class="panel-body" style="padding-left:0px; padding-right:0px;">
			<div id="compoundList"></div>
		</div>
	</div>
</div>

<!-- Import Compounds Modal -->
<div class="modal fade" id="importCompoundsModal" tabindex="-1" role="dialog" aria-labelledby="modalHeaderLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="modalHeaderLabel">Import Compounds From File</h4>
      </div>
      <div class="modal-body">
        <div class="container-fluid">
          <form class="form-horizontal" id="importCompoundsForm">
            <div class="form-group">
              <label class="control-label col-sm-3" for="compoundsFile">Compounds File:</label>
              <div class="col-sm-9">
                <input type="file" class="form-control" id="compoundsFile" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-default" onclick="importCompoundsFromFile()" data-dismiss="modal">Import</button>
      </div>
    </div>
  </div>
</div>

<!-- Save Plate Modal -->
<div class="modal fade" id="savePlateModal" tabindex="-1" role="dialog" aria-labelledby="modalHeaderLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="modalHeaderLabel">Save Plate As...</h4>
      </div>
      <div class="modal-body">
      		<div class="container-fluid">
      			<form class="form-horizontal">
      				<div class="form-group">
					    <label class="control-label col-sm-3" for="templateName">Plate Barcode:</label>
					    <div class="col-sm-9">
							<input type="text" class="form-control" id="barcode"/>
						</div>
					</div>
				</form>
      		</div>
      </div>
      <div class="modal-footer">
      	<button type="button" class="btn btn-default" onclick="saveConfigToServer()" data-dismiss="modal">Save</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- Edit Label Modal -->
<div class="modal fade" id="editLabelModal" tabindex="-1" role="dialog" aria-labelledby="modalHeaderLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="modalHeaderLabel">Edit Label</h4>
      </div>
      <div class="modal-body">
      		<div class="container-fluid">
      			<form class="form-horizontal">
      				<div class="form-group">
					    <label class="control-label col-sm-3" for="templateName">New Label Name:</label>
					    <div class="col-sm-9">
							<input type="text" class="form-control" id="editNewLabelValue"/>
						</div>
					</div>
				</form>
      		</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" onclick="editLabelName()">Save New Name</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- Edit Dose Modal -->
<div class="modal fade" id="editDoseModal" tabindex="-1" role="dialog" aria-labelledby="modalHeaderLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="modalHeaderLabel">Edit Dosage</h4>
      </div>
      <div class="modal-body">
      		<div class="container-fluid">
      			<form class="form-horizontal">
      				<div class="form-group">
					    <label class="control-label col-sm-3" for="templateName">New Dosage:</label>
					    <div class="col-sm-3">
							<input type="text" class="form-control" id="editNewDoseValue"/>
						</div>
						<label class="control-label col-sm-1" for="templateName">Units:</label>
					    <div class="col-sm-3">
							<input type="text" class="form-control" id="editNewUnitsValue"/>
						</div>
					</div>
				</form>
      		</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" onclick="editDoseValue()">Save New Dosage</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
      </div>
    </div>
  </div>
</div>

<div id="templateVals">${templateInstance}</div>
<div style="display: none;">Cell Range Selected:<span id="cellRange"></span></div>

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
<asset:javascript src="grid/Grid.js"/>
<asset:javascript src="plateEditor/editorAssignLabels.js"/>
