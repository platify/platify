
<%@ page import="edu.harvard.capstone.editor.Well" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'well.label', default: 'Well')}" />
		<title><g:message code="default.show.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#show-well" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="list" action="index"><g:message code="default.list.label" args="[entityName]" /></g:link></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="show-well" class="content scaffold-show" role="main">
			<h1><g:message code="default.show.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<ol class="property-list well">
			
				<g:if test="${wellInstance?.column}">
				<li class="fieldcontain">
					<span id="column-label" class="property-label"><g:message code="well.column.label" default="Column" /></span>
					
						<span class="property-value" aria-labelledby="column-label"><g:fieldValue bean="${wellInstance}" field="column"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${wellInstance?.plate}">
				<li class="fieldcontain">
					<span id="plate-label" class="property-label"><g:message code="well.plate.label" default="Plate" /></span>
					
						<span class="property-value" aria-labelledby="plate-label"><g:link controller="plateTemplate" action="show" id="${wellInstance?.plate?.id}">${wellInstance?.plate?.encodeAsHTML()}</g:link></span>
					
				</li>
				</g:if>
			
				<g:if test="${wellInstance?.row}">
				<li class="fieldcontain">
					<span id="row-label" class="property-label"><g:message code="well.row.label" default="Row" /></span>
					
						<span class="property-value" aria-labelledby="row-label"><g:fieldValue bean="${wellInstance}" field="row"/></span>
					
				</li>
				</g:if>
			
			</ol>
			<g:form url="[resource:wellInstance, action:'delete']" method="DELETE">
				<fieldset class="buttons">
					<g:link class="edit" action="edit" resource="${wellInstance}"><g:message code="default.button.edit.label" default="Edit" /></g:link>
					<g:actionSubmit class="delete" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:form>
		</div>
	</body>
</html>
