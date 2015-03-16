
<%@ page import="edu.harvard.capstone.result.Result" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'result.label', default: 'Result')}" />
		<title><g:message code="default.show.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#show-result" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="list" action="index"><g:message code="default.list.label" args="[entityName]" /></g:link></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="show-result" class="content scaffold-show" role="main">
			<h1><g:message code="default.show.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<ol class="property-list result">
			
				<g:if test="${resultInstance?.description}">
				<li class="fieldcontain">
					<span id="description-label" class="property-label"><g:message code="result.description.label" default="Description" /></span>
					
						<span class="property-value" aria-labelledby="description-label"><g:fieldValue bean="${resultInstance}" field="description"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${resultInstance?.equipment}">
				<li class="fieldcontain">
					<span id="equipment-label" class="property-label"><g:message code="result.equipment.label" default="Equipment" /></span>
					
						<span class="property-value" aria-labelledby="equipment-label"><g:link controller="null" action="show" id="${resultInstance?.equipment?.id}">${resultInstance?.equipment?.encodeAsHTML()}</g:link></span>
					
				</li>
				</g:if>
			
				<g:if test="${resultInstance?.experiment}">
				<li class="fieldcontain">
					<span id="experiment-label" class="property-label"><g:message code="result.experiment.label" default="Experiment" /></span>
					
						<span class="property-value" aria-labelledby="experiment-label"><g:link controller="null" action="show" id="${resultInstance?.experiment?.id}">${resultInstance?.experiment?.encodeAsHTML()}</g:link></span>
					
				</li>
				</g:if>
			
				<g:if test="${resultInstance?.name}">
				<li class="fieldcontain">
					<span id="name-label" class="property-label"><g:message code="result.name.label" default="Name" /></span>
					
						<span class="property-value" aria-labelledby="name-label"><g:fieldValue bean="${resultInstance}" field="name"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${resultInstance?.owner}">
				<li class="fieldcontain">
					<span id="owner-label" class="property-label"><g:message code="result.owner.label" default="Owner" /></span>
					
						<span class="property-value" aria-labelledby="owner-label"><g:link controller="user" action="show" id="${resultInstance?.owner?.id}">${resultInstance?.owner?.encodeAsHTML()}</g:link></span>
					
				</li>
				</g:if>
			
			</ol>
			<g:form url="[resource:resultInstance, action:'delete']" method="DELETE">
				<fieldset class="buttons">
					<g:link class="edit" action="edit" resource="${resultInstance}"><g:message code="default.button.edit.label" default="Edit" /></g:link>
					<g:actionSubmit class="delete" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:form>
		</div>
	</body>
</html>
