
<%@ page import="edu.harvard.capstone.result.RefactoredData" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'refactoredData.label', default: 'RefactoredData')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-refactoredData" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="list-refactoredData" class="content scaffold-list" role="main">
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
			<thead>
					<tr>
					
						<th><g:message code="refactoredData.result.label" default="Result" /></th>
					
						<g:sortableColumn property="value" title="${message(code: 'refactoredData.value.label', default: 'Value')}" />
					
						<th><g:message code="refactoredData.well.label" default="Well" /></th>
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${refactoredDataInstanceList}" status="i" var="refactoredDataInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
					
						<td><g:link action="show" id="${refactoredDataInstance.id}">${fieldValue(bean: refactoredDataInstance, field: "result")}</g:link></td>
					
						<td>${fieldValue(bean: refactoredDataInstance, field: "value")}</td>
					
						<td>${fieldValue(bean: refactoredDataInstance, field: "well")}</td>
					
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${refactoredDataInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
