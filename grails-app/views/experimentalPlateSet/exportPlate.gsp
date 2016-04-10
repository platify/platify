<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet?.label', default: 'Export Experiment Plate')}" />
		<title>Export Experiment Plate</title>

		<asset:stylesheet href="jquery-ui.css"/>
		<asset:stylesheet href="selectize.css"/>
	    <asset:stylesheet href="grid/style.css"/>
	    <asset:stylesheet href="grid/slick.grid.css"/>
	    <asset:stylesheet href="grid/slick-default-theme.css"/>
	    <asset:stylesheet href="grid/Grid.css"/>
	    <asset:stylesheet href="selectize.css"/>
	    
	</head>
	<body>	
		<div class="content-fluid ">
			<div class="row">
				<!--  Existing Plates -->
				<div class="col-sm-12">
					<div id="platePanel" class="panel panel-default">
						<h3 style="margin-left:15px">Export Experimental Plate</h3>
						<ol class="breadcrumb">
							<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
							<li>Export Plate</li>
						</ol>					
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
										<g:sortableColumn property="Experiment" title="Plate Id" />
										<g:sortableColumn property="name" title="${message(code: 'plateSetInstance.plate.name.label', default: 'Template Name')}" />
										<g:sortableColumn property="owner" title="${message(code: 'plateSetInstance.plate.owner.label', default: 'Owner')}" />	
										<g:sortableColumn property="dateCreated" title="${message(code: 'plateSetInstance.plate.date.label', default: 'Date')}" />
										<th>Horizontal Wells</th>
										<th>Vertical Wells</th>			<!-- Change to well size ?? -->
										<th>Preview</th>
                                      <th style="text-align: center;">CSV</th>
                                      <th style="text-align: center;">JSON</th>
                                      <th style="text-align: center;">XML</th>
									</tr>
								</thead>
								<tbody>
								<g:each in="${plateSetList}" status="i" var="plateSetInstance">
									<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
										<td>${plateSetInstance.barcode}</td>
										<td>${fieldValue(bean: plateSetInstance.plate, field: "id")}</td>
										<td>${plateSetInstance?.experiment?.name}</td>
										<td>${fieldValue(bean: plateSetInstance.plate, field: "name")}</td>
										<td>${plateSetInstance.plate.owner.firstName + ' ' + plateSetInstance.plate.owner.lastName}</td>
										<td>${fieldValue(bean: plateSetInstance.plate, field: "dateCreated")}</td>
										<td>${fieldValue(bean: plateSetInstance.plate, field: "width")}</td>
										<td>${fieldValue(bean: plateSetInstance.plate, field: "height")}</td>
										<td><button value="${plateSetInstance.id}-${fieldValue(bean: plateSetInstance.plate, field: 'width')}-${fieldValue(bean: plateSetInstance.plate, field: 'height')}"
										onclick="onViewSelect(this)" type="button" class="btn btn-info btn-xs" data-toggle="modal" data-target="#viewSavedPlateModal">View</button></td>

                                      <td style="text-align: center;"><g:link controller="experimentalPlateSet"
                                                                              action="exportPlateSetFile" id="${plateSetInstance.id}">
                                        <i class="fa fa-file-excel-o"></i>
                                      </g:link></td>

                                      <td style="text-align: center;"><g:link controller="experimentalPlateSet"
                                                                              action="exportPlateSetJson" id="${plateSetInstance.id}">
                                        <i class="fa fa-file-text-o"></i>
                                      </g:link></td>


                                      <td style="text-align: center;"><g:link controller="experimentalPlateSet"
                                                                              action="exportPlateSetXml" id="${plateSetInstance.id}">
                                        <i class="fa fa-file-text-o"></i>
                                      </g:link></td>

									</tr>
								</g:each>
								</tbody>
							</table>
							<div class="col-xs-12" style="text-align: center;">
								<ul class="pagination">
									<li><g:paginate total="${plateSetInstanceCount ?: 0}" /></li>
								</ul>
							</div>
						</div>
					</div>
				</div>
				<g:render template="/experimentalPlateSet/viewSavedPlateDialog"/>
			</div>
		</div>
	</body>
</html>





