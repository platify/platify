<%@ page import="edu.harvard.capstone.parser.Equipment" %>


    <h2>Select Existing Template:</h2>
	<div id="labelPanel" style="float:left;width:29%;">	
		<h3>Plate Details: </h3>
		<p>Experiment ID: ${experimentalPlateSetInstance.id}</p> 
		<p>Plate ID: </p> <g:select id="plateSelect" name="plate.id" from="${edu.harvard.capstone.editor.PlateTemplate.list()}" optionValue="${{it.id + ' - ' + it.name}}" optionKey="id" required="" value="${plateSetInstance?.plate?.id}" class="many-to-one"/>
		
		<h3>Filter Templates: </h3>
		<p>Template Size:</p>
		<p>Template Type: </p>
		<button id="saveTemplate">Save Choice and Continue</button>
		
		<hr/>
		<div>Cell Range Selected:<span id="cellRange"></span></div>
		<hr/>		
	</div>
	<div id="gridPanel" style="float:right; width: 70%">
		<div id="myGrid" style="width:100%;height:650px;"></div>
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
	<!--<asset:javascript src="selectize.js"/> -->
	<asset:javascript src="grid/slick.core.js"/>
    <asset:javascript src="grid/slick.grid.js"/>
    <asset:javascript src="grid/slick.autotooltips.js"/>
    <asset:javascript src="grid/slick.cellrangedecorator.js"/>
    <asset:javascript src="grid/slick.cellrangeselector.js"/>
    <asset:javascript src="grid/slick.cellcopymanager.js"/>
    <asset:javascript src="grid/slick.cellselectionmodel.js"/>
    <asset:javascript src="grid/slick.editors.js"/>
    <asset:javascript src="grid/Grid2Merge.js"/>
    <asset:javascript src="grid/Grid2Merge.js"/>
    <asset:javascript src="plateEditor/editorPreviewTemplate.js"/>


