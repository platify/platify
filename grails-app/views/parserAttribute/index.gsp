
<%@ page import="edu.harvard.capstone.parser.ParserAttribute" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'parserAttribute.label', default: 'ParserAttribute')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-parserAttribute" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="list-parserAttribute" class="content scaffold-list" role="main">
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
			<thead>
					<tr>
					
						<th><g:message code="parserAttribute.equipment.label" default="Equipment" /></th>
					
						<g:sortableColumn property="name" title="${message(code: 'parserAttribute.name.label', default: 'Name')}" />
					
						<g:sortableColumn property="value" title="${message(code: 'parserAttribute.value.label', default: 'Value')}" />
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${parserAttributeInstanceList}" status="i" var="parserAttributeInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
					
						<td><g:link action="show" id="${parserAttributeInstance.id}">${fieldValue(bean: parserAttributeInstance, field: "equipment")}</g:link></td>
					
						<td>${fieldValue(bean: parserAttributeInstance, field: "name")}</td>
					
						<td>${fieldValue(bean: parserAttributeInstance, field: "value")}</td>
					
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${parserAttributeInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
