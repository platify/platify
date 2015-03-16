
<%@ page import="edu.harvard.capstone.result.RawData" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'rawData.label', default: 'RawData')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-rawData" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="list-rawData" class="content scaffold-list" role="main">
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
			<thead>
					<tr>
					
						<th><g:message code="rawData.result.label" default="Result" /></th>
					
						<g:sortableColumn property="value" title="${message(code: 'rawData.value.label', default: 'Value')}" />
					
						<th><g:message code="rawData.well.label" default="Well" /></th>
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${rawDataInstanceList}" status="i" var="rawDataInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
					
						<td><g:link action="show" id="${rawDataInstance.id}">${fieldValue(bean: rawDataInstance, field: "result")}</g:link></td>
					
						<td>${fieldValue(bean: rawDataInstance, field: "value")}</td>
					
						<td>${fieldValue(bean: rawDataInstance, field: "well")}</td>
					
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${rawDataInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
