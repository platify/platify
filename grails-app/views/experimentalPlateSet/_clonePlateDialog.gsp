<%@ page import="edu.harvard.capstone.editor.PlateSet; edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<%@ page import="edu.harvard.capstone.editor.PlateSet; edu.harvard.capstone.editor.PlateSet" %>
<script type="text/javascript" charset="utf-8">
	function clonePlate() {
		var expIdParam = ${experimentalPlateSetInstance.id} + "" ;

		var goTolocation = hostname + "/experimentalPlateSet/createPlateCloned"
			+ '?expid=' + document.getElementById("sourceExperiment").value
	    	+ '&sourceplate=' + document.getElementById("sourcePlate").value;

		window.location.href = goTolocation;
	}

	function listPlates(data) {
        $('#sourcePlate').empty();
        var sourcePlate = document.getElementById("sourcePlate");
        data.plates.forEach(function(plate) {
            var plateOption = new Option(plate.barcode, plate.id, false, false);
            sourcePlate.options[sourcePlate.options.length] = plateOption;
        });
	}
</script>

<!-- Modal -->
<div class="modal fade" id="clonePlateModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="myModalLabel">Select Plate to Clone</h4>
            </div>
            <div class="modal-body">
                <div class="container-fluid">
                    <form class="form-horizontal">
                        <div class="form-group">
                            <label class="control-label col-sm-3" for="sourceExperiment">Experiment:</label>
                            <div class="col-sm-9">
                                <g:select name="sourceExperiment" class="form-control" from ="${ExperimentalPlateSet.findAll()}"
                                        optionKey="id" optionValue="name" noSelection="[null:' ']"
                                        onchange="${remoteFunction(controller:"plate", action:"getPlates",
                                        params: "'id=' + this.value", onSuccess: 'listPlates(data)')}"/>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="control-label col-sm-3" for="sourcePlate">Plate:</label>
                            <div class="col-sm-9">
                                %{--<select class="form-control" id="sourcePlate"></select>--}%
                                <g:select name="sourcePlate" id="sourcePlate" class="form-control"
                                          from ="${PlateSet.findAllByExperiment(ExperimentalPlateSet.findById(exp_id))}"
                                          optionKey="id" optionValue="barcode" noSelection="[null:' ']"/>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-default" onclick="clonePlate()" data-dismiss="modal">Clone Plate</button>
            </div>
        </div>
    </div>
</div>
