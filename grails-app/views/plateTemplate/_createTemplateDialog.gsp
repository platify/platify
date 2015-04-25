<script type="text/javascript" charset="utf-8">
	function goToCreateTemplate() {
		var expIdParam = ${experimentalPlateSetInstance?.id} + "" ;
		
		var goTolocation = hostname + "/plateTemplate/create"
			+ '?name=' + document.getElementById("templateName").value
	    	+ '&width=' + document.getElementById("templateWidth").value
	    	+ '&height=' + document.getElementById("templateHeight").value;

    	if (expIdParam != "") {
    		goTolocation = goTolocation + '&expid=' + expIdParam;
        }
		window.location.href = goTolocation;
	}

	function updateWellCountFields(sel) {
		switch(sel.value) {
		    case "96 wells":
		    	document.getElementById("templateWidth").value = "12";
		    	document.getElementById("templateHeight").value = "8";
		        break;
		    case "386 wells":
		    	document.getElementById("templateWidth").value = "24";
		    	document.getElementById("templateHeight").value = "16";
		        break;
		    case "1536 wells":
		    	document.getElementById("templateWidth").value = "48";
		    	document.getElementById("templateHeight").value = "32";
		        break;
		    case "3456 wells":
		    	document.getElementById("templateWidth").value = "72";
		    	document.getElementById("templateHeight").value = "48";
		        break;
		    case "9600 wells":
		    	document.getElementById("templateWidth").value = "120";
		    	document.getElementById("templateHeight").value = "80";
		        break;
		    case "custom":
		    	document.getElementById("templateWidth").value = "";
		    	document.getElementById("templateHeight").value = "";
		    	// should enable the text fields here !!!
		        break;
		    default:
			    // default to 96 well
		    	document.getElementById("templateWidth").value = "12";
	    		document.getElementById("templateHeight").value = "8";
	    		break;
		}
	}
</script>

<!-- Modal -->
<div class="modal fade" id="createTemplateModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">New Template Details</h4>
      </div>
      <div class="modal-body">
      		<div class="container-fluid">
      			<form class="form-horizontal">
      				<div class="form-group">
					    <label class="control-label col-sm-3" for="templateName">Name:</label>
					    <div class="col-sm-9">
							<input type="text" class="form-control" id="templateName"/>
						</div>
					</div>
					<div class="form-group">
  						<label class="control-label col-sm-3" for="wellCount">Well Count:</label>
  						<div class="col-sm-9">
  							<select class="form-control" id="wellCount" onchange="updateWellCountFields(this)">
							  <option>96 wells</option>
							  <option>386 wells</option>
							  <option>1536 wells</option>
							  <option>3456 wells</option>
							  <option>9600 wells</option>
							 <!--  <option>custom</option> -->
							</select>
						</div>
					</div>
					<div class="form-group">
						<label class="control-label col-sm-2" for="templateWidth">Horizontal-Wells:</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="templateWidth" value="12" disabled/>
						</div>
						<label class="control-label col-sm-2" for="templateHeight">Vertical-Wells:</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="templateHeight" value="8" disabled/>
						</div>
					</div>
				</form>
      		</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-default" onclick="goToCreateTemplate()" data-dismiss="modal">Create Template</button>
      </div>
    </div>
  </div>
</div>