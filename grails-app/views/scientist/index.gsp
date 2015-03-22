
<%@ page import="edu.harvard.capstone.user.Scientist" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'scientist.label', default: 'Scientist')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#list-scientist" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="list-scientist" class="content scaffold-list" role="main">
			<h1><g:message code="default.list.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
				<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table>
			<thead>
					<tr>
					
						<g:sortableColumn property="username" title="${message(code: 'scientist.username.label', default: 'Username')}" />
					
						<g:sortableColumn property="password" title="${message(code: 'scientist.password.label', default: 'Password')}" />
					
						<g:sortableColumn property="email" title="${message(code: 'scientist.email.label', default: 'Email')}" />
					
						<g:sortableColumn property="accountExpired" title="${message(code: 'scientist.accountExpired.label', default: 'Account Expired')}" />
					
						<g:sortableColumn property="accountLocked" title="${message(code: 'scientist.accountLocked.label', default: 'Account Locked')}" />
					
						<g:sortableColumn property="enabled" title="${message(code: 'scientist.enabled.label', default: 'Enabled')}" />
					
					</tr>
				</thead>
				<tbody>
				<g:each in="${scientistInstanceList}" status="i" var="scientistInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
					
						<td><g:link action="show" id="${scientistInstance.id}">${fieldValue(bean: scientistInstance, field: "username")}</g:link></td>
					
						<td>${fieldValue(bean: scientistInstance, field: "password")}</td>
					
						<td>${fieldValue(bean: scientistInstance, field: "email")}</td>
					
						<td><g:formatBoolean boolean="${scientistInstance.accountExpired}" /></td>
					
						<td><g:formatBoolean boolean="${scientistInstance.accountLocked}" /></td>
					
						<td><g:formatBoolean boolean="${scientistInstance.enabled}" /></td>
					
					</tr>
				</g:each>
				</tbody>
			</table>
			<div class="pagination">
				<g:paginate total="${scientistInstanceCount ?: 0}" />
			</div>
		</div>
	</body>
</html>
