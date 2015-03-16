
<%@ page import="edu.harvard.capstone.editor.Well" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'well.label', default: 'Well')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-well" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="list-well" class="content scaffold-list" role="main">
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
			<thead>
					<tr>
					
						<g:sortableColumn property="column" title="${message(code: 'well.column.label', default: 'Column')}" />
					
						<th><g:message code="well.plate.label" default="Plate" /></th>
					
						<g:sortableColumn property="row" title="${message(code: 'well.row.label', default: 'Row')}" />
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${wellInstanceList}" status="i" var="wellInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
					
						<td><g:link action="show" id="${wellInstance.id}">${fieldValue(bean: wellInstance, field: "column")}</g:link></td>
					
						<td>${fieldValue(bean: wellInstance, field: "plate")}</td>
					
						<td>${fieldValue(bean: wellInstance, field: "row")}</td>
					
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${wellInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
