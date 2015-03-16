
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-experimentalPlateSet" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="list-experimentalPlateSet" class="content scaffold-list" role="main">
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
			<thead>
					<tr>
					
						<g:sortableColumn property="description" title="${message(code: 'experimentalPlateSet.description.label', default: 'Description')}" />
					
						<g:sortableColumn property="name" title="${message(code: 'experimentalPlateSet.name.label', default: 'Name')}" />
					
						<th><g:message code="experimentalPlateSet.owner.label" default="Owner" /></th>
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${experimentalPlateSetInstanceList}" status="i" var="experimentalPlateSetInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
					
						<td><g:link action="show" id="${experimentalPlateSetInstance.id}">${fieldValue(bean: experimentalPlateSetInstance, field: "description")}</g:link></td>
					
						<td>${fieldValue(bean: experimentalPlateSetInstance, field: "name")}</td>
					
						<td>${fieldValue(bean: experimentalPlateSetInstance, field: "owner")}</td>
					
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${experimentalPlateSetInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
