
<%@ page import="edu.harvard.capstone.result.Result" %>
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'result.label', default: 'Result')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<!-- Left Column -->
				<div class="col-sm-2">
					<div>
					<g:select
						id="experimentSelect"
						name="name"
						from="${edu.harvard.capstone.editor.ExperimentalPlateSet.list()}"
						optionKey="id"
						optionValue="${{it.name + " - " + it.id}}"
						onchange="updatePlateList(this.value)"
					/>
					</div>
					<div>
					<select id="plateSelect"></select>
				</div> <!-- Left Column END -->
				<!-- Right Column -->
				<div class="col-sm-9">
					<div id="list-result" class="content scaffold-list" role="main">
						<h1><g:message code="default.list.label" args="[entityName]" /></h1>
						<g:if test="${flash.message}">
							<div class="message" role="status">${flash.message}</div>
						</g:if>
						<table class="table table-striped table-hover">
						<thead>
								<tr>
								
									<g:sortableColumn property="description" title="${message(code: 'result.description.label', default: 'Description')}" />
								
									<g:sortableColumn property="equipment" title="${message(code: 'result.equipment.label', default: 'Equipment')}" />
								
									<g:sortableColumn property="experiment" title="${message(code: 'result.experiment.label', default: 'Experiment')}" />
								
									<g:sortableColumn property="name" title="${message(code: 'result.name.label', default: 'Name')}" />
								
									<g:sortableColumn property="owner" title="${message(code: 'result.owner.label', default: 'Owner')}" />

									<th>View</th>
								</tr>
							</thead>
							<tbody>
							<g:each in="${resultInstanceList}" status="i" var="resultInstance">
								<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
								
									<td>${fieldValue(bean: resultInstance, field: "description")}</td>
								
									<td>${fieldValue(bean: resultInstance, field: "equipment")}</td>
								
									<td>${fieldValue(bean: resultInstance, field: "experiment")}</td>
								
									<td>${fieldValue(bean: resultInstance, field: "name")}</td>
								
									<td>${fieldValue(bean: resultInstance, field: "owner")}</td>
									<td>
										<g:link id="${resultInstance.id}" action="show"><i class="fa fa=check parse-btn"></i></g:link>
									</td>
								</tr>
							</g:each>
							</tbody>
						</table>
						<ul class="pagination">
							<li><g:paginate total="${resultInstanceCount ?: 0}" /></li>
						</ul>
					</div>	
				</div> <!-- Right Column END -->	
			</div>
		</div>
	<asset:javascript src="result/index.js" />
	</body>
</html>
