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
	
	.color-box {
	    width: 15px;
	    height: 15px;
	    display: inline-block;
	    background-color: #ccc;
	    padding-left: 7px;
	    left: 10px;
	    top: 5px;
	}
	
	.glyphicon-refresh-animate {
	    -animation: spin .7s infinite linear;
	    -webkit-animation: spin2 .7s infinite linear;
	}
	
	@-webkit-keyframes spin2 {
	    from { -webkit-transform: rotate(0deg);}
	    to { -webkit-transform: rotate(360deg);}
	}
	
	@keyframes spin {
	    from { transform: scale(1) rotate(0deg);}
	    to { transform: scale(1) rotate(360deg);}
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
			<div class="modal-body" style="padding:0px">
				<div class="toggler" id="loaderView">
					<div class="col-sm-5"></div>
					<div class="col-sm-2" style="padding:50px">
						<button class="btn btn-lg btn-info"><span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...</button>
					</div>
					<div class="col-sm-5"></div>
				</div>
				<div class="toggler" id="gridView">
					<div class="col-sm-8" style="padding:0px">
						<div id="myGrid" style="width:100%; height:500px;"></div>
					</div>
					<div class="col-sm-2" style="padding:0px; height:500px;">
						<div class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Well Labels</h4>
							</div>
							<div class="panel-body">
								<div id="categoryList"></div>
							</div>
						</div>
					</div>
					<div class="col-sm-2" style="padding:0px; height:500px;">
						<div class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Compounds</h4>
							</div>
							<div class="panel-body">
								<div id="compoundList"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
			</div>
		</div>
	</div>
</div>