
<%@ page import="edu.harvard.capstone.editor.PlateSet" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'plateSet.label', default: 'PlateSet')}" />
		<title><g:message code="default.show.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#show-plateSet" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="list" action="index"><g:message code="default.list.label" args="[entityName]" /></g:link></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="show-plateSet" class="content scaffold-show" role="main">
			<h1><g:message code="default.show.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<ol class="property-list plateSet">
			
				<g:if test="${plateSetInstance?.assay}">
				<li class="fieldcontain">
					<span id="assay-label" class="property-label"><g:message code="plateSet.assay.label" default="Assay" /></span>
					
						<span class="property-value" aria-labelledby="assay-label"><g:fieldValue bean="${plateSetInstance}" field="assay"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${plateSetInstance?.experiment}">
				<li class="fieldcontain">
					<span id="experiment-label" class="property-label"><g:message code="plateSet.experiment.label" default="Experiment" /></span>
					
						<span class="property-value" aria-labelledby="experiment-label"><g:link controller="experimentalPlateSet" action="show" id="${plateSetInstance?.experiment?.id}">${plateSetInstance?.experiment?.encodeAsHTML()}</g:link></span>
					
				</li>
				</g:if>
			
				<g:if test="${plateSetInstance?.plate}">
				<li class="fieldcontain">
					<span id="plate-label" class="property-label"><g:message code="plateSet.plate.label" default="Plate" /></span>
					
						<span class="property-value" aria-labelledby="plate-label"><g:link controller="plateTemplate" action="show" id="${plateSetInstance?.plate?.id}">${plateSetInstance?.plate?.encodeAsHTML()}</g:link></span>
					
				</li>
				</g:if>
			
			</ol>
			<g:form url="[resource:plateSetInstance, action:'delete']" method="DELETE">
				<fieldset class="buttons">
					<g:link class="edit" action="edit" resource="${plateSetInstance}"><g:message code="default.button.edit.label" default="Edit" /></g:link>
					<g:actionSubmit class="delete" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:form>
		</div>
	</body>
</html>
