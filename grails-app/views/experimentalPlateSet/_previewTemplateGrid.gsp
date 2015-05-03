<%@ page import="edu.harvard.capstone.parser.Equipment" %>

	<div class="col-sm-6">
		<div id="labelPanel" class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">Choose Template (for assay with id: ${experimentalPlateSetInstance.id})</h4>
			</div>
			<div class="panel-body" style="padding:2px">
				<form class="form-horizontal">
			      	<div class="form-group" style="margin-bottom:0px">
						<h4><label class="control-label col-sm-2" for="plateSelect">Templates: </label></h4>
					    <div class="col-sm-9">
							 <div id="templateSelection">
							  	<g:select class="form-control" id="plateSelect" name="plate.id" from="${edu.harvard.capstone.editor.PlateTemplate.list()}" 
							  		optionKey="id" optionValue="${{it.name + ' (id:' + it.id + ')'}}"
									onchange="onPlateSelectChange(this)" onload="onPlateSelectChange(this)" value="${plateSetInstance?.plate?.id}" class="many-to-one"/> 
							 </div>
						</div>						
			      	</div>
				</form>
			</div>
		</div>
	</div>
	<div class="col-sm-6">
		<div id="filterPanel" class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">Filter Template Choices</h4>
			</div>
			<div class="panel-body" style="padding:5px">
				<form class="form-horizontal">
			      	<div class="form-group" style="margin-bottom:0px">
			      		<h4><label class="control-label col-sm-2" for="tSizeFilter">Size: </label></h4>
					    <div class="col-sm-3">
							<g:select class="form-control" name="weltSizeFilter" from="${['Any', '96 wells', '384 wells', '1536 wells', '3456 wells', '9600 wells']}"
				                onchange="${remoteFunction (
				                        controller: 'plateTemplate',
				                        action: 'filterTemplateBySize',
				                        params: '\'filterWells=\'+escape(this.value)',
				                        update: 'templateSelection',
										onSuccess: 'updatePlateSelection();'
				                )}" />
						</div>
						<!-- <h4><label class="control-label col-sm-2" for="tTypeFilter">Type: </label></h4>
					    <div class="col-sm-3">
							<select class="form-control" id="tTypeFilter">
							  <option>Any</option>
							  <option>Bio-plate</option>
							  <option>Chem-plate</option>
							</select>
						</div>			 -->			
			      	</div>
				</form>
			</div>
		</div>
	</div>
	<div class="col-sm-12">
		<div id="gridPanel" class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">Preview Grid</h4>
			</div>
			<div class="panel-body" style="padding:0px">
				<div id="myGrid" style="width:100%; height:650px;"></div>
			</div>
		</div>
	</div>
	
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
    <asset:javascript src="selectize.js"/>
    <asset:javascript src="grid/Grid2Merge.js"/>
    <asset:javascript src="plateEditor/editorPreviewTemplate.js"/>


