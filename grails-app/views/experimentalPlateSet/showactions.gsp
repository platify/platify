<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet')}" />
		<title><g:message code="default.create.label" args="[entityName]" /></title>
		
		<asset:stylesheet href="jquery-ui.css"/>
	    <asset:stylesheet href="grid/style.css"/>
	    <asset:stylesheet href="grid/slick.grid.css"/>
	    <asset:stylesheet href="grid/slick-default-theme.css"/>
	    <asset:stylesheet href="grid/Grid.css"/>
	    
	    <script type="text/javascript" charset="utf-8">
			function goToCreateTemplate() {
				window.location.href = hostname + "/plateTemplate/create/"
					+ ${experimentalPlateSetInstance.id}
					+ '?name=' + document.getElementById("templateName").value
			    	+ '&width=' + document.getElementById("templateWidth").value
			    	+ '&heigth=' + document.getElementById("templateHeight").value;
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
	</head>
	<body>
		<div class="content-fluid ">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h2>Selected Experiment:</h2>
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Experiments</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="showactions" id="${experimentalPlateSetInstance.id}">Show Experiment</g:link></li>
					</ol>
					<div class="col-sm-6">
						<div id="expDetailsPanel" class="panel panel-info">
							<div class="panel-heading">
								<h4 class="panel-title">Experiment Details</h4>
							</div>
							<div class="panel-body ">
								<h4><span style="font-weight:bold">Experiment ID: </span> ${experimentalPlateSetInstance.id}</h4>
								<h4><span style="font-weight:bold">Experiment Name: </span> ${experimentalPlateSetInstance.name}</h4>
								<h4><span style="font-weight:bold">Experiment Description: </span> ${experimentalPlateSetInstance.description}</h4>
								<h4><span style="font-weight:bold">Experiment Owner: </span> ${experimentalPlateSetInstance.owner}</h4>
							</div>
						</div>
					</div>
					<div class="col-sm-6">
						<div id="expActionPanel" class="panel panel-info">
							<div class="panel-heading">
								<h4 class="panel-title">Add New Plate to Experiment:</h4>
							</div>
							<div class="panel-body">
								<g:link id="${experimentalPlateSetInstance.id}" action="selectTemplate" class="btn btn-info btn-sm">Select Existing Template</g:link>
								<button type="button" class="btn btn-info btn-sm" data-toggle="modal" data-target="#createTemplateModal">Create New Template</button>
							</div>
						</div>
					</div>
				
					<!--  Existing Plates -->
					<div class="col-sm-12">
						<div id="platePanel" class="panel panel-info">
							<div class="panel-heading">
								<h4 class="panel-title">Experiment Plate List:</h4>
							</div>
							<div class="panel-body ">
								<g:if test="${flash.message}">
									<div class="message" role="status">${flash.message}</div>
								</g:if>
								<table class="table table-striped table-hover">
								<thead>
										<tr>
											<g:sortableColumn property="id" title="#" />
											<g:sortableColumn property="name" title="${message(code: 'plateTemplate.name.label', default: 'Name')}" />
											<g:sortableColumn property="owner" title="${message(code: 'plateTemplate.owner.label', default: 'Owner')}" />	
											<g:sortableColumn property="dateCreated" title="${message(code: 'plateTemplate.date.label', default: 'Date')}" />																
										</tr>
									</thead>
									<tbody>
									<g:each in="${plateTemplatelist}" status="i" var="plateTemplateInstance">
										<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
											<td><h5>${plateTemplateInstance.id}</h5></td>
											<td><h5>${fieldValue(bean: plateTemplateInstance, field: "name")}</h5></td>
											<td><h5>${plateTemplateInstance.owner.firstName + ' ' + plateTemplateInstance.owner.lastName}</h5></td>
											<td><h5>${fieldValue(bean: plateTemplateInstance, field: "dateCreated")}</h5></td>
										</tr>
									</g:each>
									</tbody>
								</table>
								<div class="pagination">
									<g:paginate total="${plateTemplateInstanceCount ?: 0}" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

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
	</body>
</html>
