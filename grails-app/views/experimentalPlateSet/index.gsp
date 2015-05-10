
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'Experiment')}" />
		<title>Assays</title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h3 style="margin-left:15px">Assays</h3>
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li>Assays</li>
					</ol>
					<div class="col-sm-12">
						<div id="expDetailsPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Assay List<span class="pull-right"><g:link class="btn btn-info btn-xs" action="create">Create Assay</g:link></span></h4>
							</div>
							<div class="panel-body ">
								<div id="list-scientist" class="content scaffold-list" role="main">
									<table class="table table-striped table-hover">
									<thead>
											<tr>
												<g:sortableColumn property="id" title="#" />
												<g:sortableColumn property="name" title="${message(code: 'equipment.name.label', default: 'Name')}" />
												<g:sortableColumn property="description" title="${message(code: 'equipment.description.label', default: 'Description')}" />
												<g:sortableColumn property="owner" title="${message(code: 'equipment.machine.label', default: 'Owner')}" />	
												<g:sortableColumn property="dateCreated" title="${message(code: 'equipment.date.label', default: 'Date')}" />																
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
										<g:each in="${experimentalPlateSetInstanceList}" status="i" var="experimentInstance">
											<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
												<td>${experimentInstance.id}</td>
												<td>${fieldValue(bean: experimentInstance, field: "name")}</td>
												<td>${fieldValue(bean: experimentInstance, field: "description")}</td>
												<td>${experimentInstance.owner.firstName + ' ' + experimentInstance.owner.lastName}</td>
												<td>${fieldValue(bean: experimentInstance, field: "dateCreated")}</td>
												<td>
												<g:link class="btn btn-info btn-xs"
													id="${experimentInstance.id}"
							 						action="showactions">Show Details</g:link>
												<g:link class="btn btn-info btn-xs ${disabled[experimentInstance.id]}"
													id="${experimentInstance.id}"
													controller="result"
													action="showactions">Show Results</g:link>
												</td>
											</tr>
										</g:each>
										</tbody>
									</table>
									<ul class="pagination">
										<li><g:paginate total="${experimentalPlateSetInstanceCount ?: 0}" /></li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
