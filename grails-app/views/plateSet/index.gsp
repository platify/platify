
<%@ page import="edu.harvard.capstone.editor.PlateSet" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'plateSet.label', default: 'PlateSet')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-plateSet" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="list-plateSet" class="content scaffold-list" role="main">
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
			<thead>
					<tr>
					
						<g:sortableColumn property="assay" title="${message(code: 'plateSet.assay.label', default: 'Assay')}" />
					
						<th><g:message code="plateSet.experiment.label" default="Experiment" /></th>
					
						<th><g:message code="plateSet.plate.label" default="Plate" /></th>
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${plateSetInstanceList}" status="i" var="plateSetInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
					
						<td><g:link action="show" id="${plateSetInstance.id}">${fieldValue(bean: plateSetInstance, field: "assay")}</g:link></td>
					
						<td>${fieldValue(bean: plateSetInstance, field: "experiment")}</td>
					
						<td>${fieldValue(bean: plateSetInstance, field: "plate")}</td>
					
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${plateSetInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
