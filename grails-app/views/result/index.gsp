
<%@ page import="edu.harvard.capstone.result.Result" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'result.label', default: 'Result')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-result" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="list-result" class="content scaffold-list" role="main">
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
			<thead>
					<tr>
					
						<g:sortableColumn property="description" title="${message(code: 'result.description.label', default: 'Description')}" />
					
						<th><g:message code="result.equipment.label" default="Equipment" /></th>
					
						<th><g:message code="result.experiment.label" default="Experiment" /></th>
					
						<g:sortableColumn property="name" title="${message(code: 'result.name.label', default: 'Name')}" />
					
						<th><g:message code="result.owner.label" default="Owner" /></th>
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${resultInstanceList}" status="i" var="resultInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
					
						<td><g:link action="show" id="${resultInstance.id}">${fieldValue(bean: resultInstance, field: "description")}</g:link></td>
					
						<td>${fieldValue(bean: resultInstance, field: "equipment")}</td>
					
						<td>${fieldValue(bean: resultInstance, field: "experiment")}</td>
					
						<td>${fieldValue(bean: resultInstance, field: "name")}</td>
					
						<td>${fieldValue(bean: resultInstance, field: "owner")}</td>
					
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${resultInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
