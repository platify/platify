<%@ page import="edu.harvard.capstone.parser.Equipment" %>

	<div class="col-sm-9">
		<div id="labelPanel" class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">Add Well Group</h4>
			</div>
			<div class="panel-body" style="padding:8px">
					<label for="newLabelValue" class="col-xs-2 control-label">Template Value:</label>
					<div class="col-xs-2">
						<div class="input-group">
						<input type="text" id="newLabelValue" class="input-sm form-control" required maxlength="3" 
							title="Use up to 3 alphanumeric characters for well group reference."></input>
							<span class="input-group-btn"><button id="addTemplateValueBtn" class="btn btn-default btn-sm glyphicon glyphicon-plus"></button></span>
						</div>
					</div>
					
					<div class="col-xs-6">
						<label for="wellTypeGrp" class="control-label"> Well Type:</label>
						<div class="btn-group" data-toggle="buttons" id="wellTypeGrp">
			                <label class="btn btn-default btn-xs active">
			                    <input type="radio" name="wellType" id="compoundType" value="compound" checked/>Compound
			                </label>
			                <label class="btn btn-default btn-xs">
			                    <input type="radio" name="wellType" id="posType" value="positive"/>Pos Control
			                </label>
			                <label class="btn btn-default btn-xs">
			                    <input type="radio" name="wellType" id="negType" value="negative"/>Neg Control
			                </label>
			                <label class="btn btn-default btn-xs">
			                    <input type="radio" name="wellType" id="emptyType" value="empty"/>Empty
			                </label>
			            </div>
					</div>
			</div>
		</div>
	</div>
	
	<div class="col-sm-3">
		<div id="labelPanel" class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">Other Actions<span class="pull-right"></span></h4>
			</div>
			<div class="panel-body ">
				<button id="importTemplateValueListBtn" class="btn btn-info btn-xs ui-state-disabled">Import Template Values</button>
				<!-- <button id="resetTemplateBtn" class="btn btn-info btn-xs ui-state-disabled">Reset Template</button> -->
			</div>
		</div>
	</div>
	
	<div class="col-sm-12">
		<div id="gridPanel" class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">Plate Layout<span class="pull-right"><button id="clearAllSelection" class="btn btn-info btn-xs">Clear Selection</button></span></h4>
			</div>
			<div class="panel-body">
				<div id="myGrid" style="width:100%; height:650px;"></div>
			</div>
		</div>
	</div>
	
	<div style="display: none;">Well Groupings:<span id="wellGroupSpan"></span>Cell Range Selected:<span id="cellRange"></span></div>

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
