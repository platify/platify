<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet')}" />
		<title>Selected Assay</title>
	</head>
	<body>
		<div class="content-fluid ">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h3 style="margin-left:15px">${experimentalPlateSetInstance.name}</h3>
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Assays</g:link></li>
						<li>Show Assay</li>
					</ol>
					<div class="col-sm-6">
						<div id="expDetailsPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Assay Details</h4>
							</div>
							<div class="panel-body ">
								<h4>Assay ID: ${experimentalPlateSetInstance.id}</h4>
								<h4>Assay Description: ${experimentalPlateSetInstance.description}</h4>
								<h4>Assay Owner: ${experimentalPlateSetInstance.owner}</h4>
							</div>
						</div>
					</div>
					<div class="col-sm-6">
						<div id="expActionPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Add New Plate to Assay:</h4>
							</div>
							<div class="panel-body">
								<g:link id="${experimentalPlateSetInstance.id}" action="selectTemplate" class="btn btn-info btn-sm">Select Existing Template</g:link>
								<button type="button" class="btn btn-info btn-sm" data-toggle="modal" data-target="#createTemplateModal">Create New Template</button>
							</div>
						</div>
					</div>
				
					<!--  Existing Plates -->
					<div class="col-sm-12">
						<div id="platePanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Assay Plate List:</h4>
							</div>
							<div class="panel-body ">
								<g:if test="${flash.message}">
									<div class="message" role="status">${flash.message}</div>
								</g:if>
								<table class="table table-striped table-hover">
								<thead>
										<tr>
											<g:sortableColumn property="barcode" title="Barcode" />
											<g:sortableColumn property="id" title="Plate Id" />
											<g:sortableColumn property="name" title="${message(code: 'plateSetInstance.plate.name.label', default: 'Template Name')}" />
											<g:sortableColumn property="owner" title="${message(code: 'plateSetInstance.plate.owner.label', default: 'Owner')}" />	
											<g:sortableColumn property="dateCreated" title="${message(code: 'plateSetInstance.plate.date.label', default: 'Date')}" />
											<g:sortableColumn property="width" title="Horizontal Wells" />
											<g:sortableColumn property="height" title="Vertical Wells" />
											<th>Preview</th>
											<th style="text-align: center;">Export CSV</th>
											<th style="text-align: center;">Export JSON</th>
											<th style="text-align: center;">Export XML</th>
										</tr>
									</thead>
									<tbody>
									<g:each in="${plateSetlist}" status="i" var="plateSetInstance">
										<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
											<td>${plateSetInstance.barcode}</td>
											<td>${fieldValue(bean: plateSetInstance.plate, field: "id")}</td>
											<td>${fieldValue(bean: plateSetInstance.plate, field: "name")}</td>
											<td>${plateSetInstance.plate.owner.firstName + ' ' + plateSetInstance.plate.owner.lastName}</td>
											<td>${fieldValue(bean: plateSetInstance.plate, field: "dateCreated")}</td>
											<td>${fieldValue(bean: plateSetInstance.plate, field: "width")}</td>
											<td>${fieldValue(bean: plateSetInstance.plate, field: "height")}</td>
											<td><button value="${plateSetInstance.id}-${fieldValue(bean: plateSetInstance.plate, field: 'width')}-${fieldValue(bean: plateSetInstance.plate, field: 'height')}"
											onclick="onViewSelect(this)" type="button" class="btn btn-info btn-xs" data-toggle="modal" data-target="#viewSavedPlateModal">View</button></td>
											<td style="text-align: center;"><g:link controller="experimentalPlateSet" action="exportPlateSetFile" id="${plateSetInstance.id}">
												<i class="fa fa-file-excel-o"></i>
											</g:link></td>
											<td style="text-align: center;"><g:link
													controller="experimentalPlateSet" action="exportPlateSetJSON" id="${plateSetInstance.id}">
												<i class="fa fa-file-excel-o"></i>
											</g:link></td>
											<td style="text-align: center;"><g:link controller="experimentalPlateSet"
																					action="exportPlateSetXml" id="${plateSetInstance.id}">
												<i class="fa fa-file-excel-o"></i>
											</g:link></td>
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
		
		<g:render template="/plateTemplate/createTemplateDialog"/>
		<g:render template="/experimentalPlateSet/viewSavedPlateDialog"/>
	</body>
</html>
