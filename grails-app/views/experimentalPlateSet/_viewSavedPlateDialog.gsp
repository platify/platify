<asset:stylesheet href="jquery-ui.css"/>
<asset:stylesheet href="grid/style.css"/>
<asset:stylesheet href="grid/slick.grid.css"/>
<asset:stylesheet href="grid/slick-default-theme.css"/>
<asset:stylesheet href="grid/Grid.css"/>
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
<asset:javascript src="grid/Grid.js"/>
<asset:javascript src="plateEditor/editorCommon.js"/>
<asset:javascript src="plateEditor/editorPreviewSavedPlates.js"/>

<style>
	#gridViewModel {
	    width: 100%;
	}
	
	.modal-body {
	  overflow-y: auto;
	}
</style>

<!-- Modal -->
<div class="modal fade" id="viewSavedPlateModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div id="gridViewModel" class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">Plate Preview</h4>
      </div>
      <div class="modal-body">
      	<div class="container-fluid">
      		<div class="col-sm-8">
      			<div id="myGrid" style="width:100%; height:500px;"></div>
      		</div>
      		<div class="col-sm-2">
      			<h5>Well Labels</h5>
      			<div id="categoryList"></div>
      		</div>
      		<div class="col-sm-2">
      			<h5>Compounds</h5>
      			<div id="compoundList"></div>
      		</div>
      	</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
      </div>
    </div>
  </div>
</div>