<%@ page import="edu.harvard.capstone.parser.Equipment" %>

	<div class="col-sm-3">
		<div id="labelPanel" class="panel panel-info">
			<div class="panel-heading">
				<h4>Plate Details</h4>
			</div>
			<div class="panel-body">
				<label>Experiment ID:</label>
				<p">${experimentalPlateSetInstance.id}</p>
				<label>Plate ID: </label> 
				<g:select id="plateSelect" name="plate.id" from="${edu.harvard.capstone.editor.PlateTemplate.list()}" 
					optionValue="${{it.name + ' - ' + it.id}}" optionKey="id" required="" value="${plateSetInstance?.plate?.id}" class="many-to-one"/>
				
				<hr/>
				<div>Cell Range Selected:<span id="cellRange"></span></div>
				<hr/>
				<button class="btn btn-info" id="saveTemplate">Save Choice and Continue</button>				
			</div>
		</div>
		<div id="labelPanel" class="panel panel-info">
			<div class="panel-heading">
				<h4>Filter Templates</h4>
			</div>
			<div class="panel-body">
				<p>Template Size:</p>
				<p>Template Type: </p>
				<hr/>
				<div>Cell Range Selected:<span id="cellRange"></span></div>
				<hr/>
			</div>
		</div>
	</div>
	<div class="col-sm-9">
		<div id="gridPanel" class="panel panel-info">
			<div class="panel-heading">
				<h4>Preview Grid</h4>
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
    <asset:javascript src="selectize.js"/>
    <asset:javascript src="grid/Grid2Merge.js"/>
    <asset:javascript src="plateEditor/editorPreviewTemplate.js"/>


