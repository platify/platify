
<%@ page import="edu.harvard.capstone.result.RawData" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'rawData.label', default: 'RawData')}" />
		<title><g:message code="default.show.label" args="[entityName]" /></title>
	</head>
	<body>
		<a href="#show-rawData" class="skip" tabindex="-1"><g:message code="default.link.skip.label" default="Skip to content&hellip;"/></a>
		<div class="nav" role="navigation">
			<ul>
				<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
				<li><g:link class="list" action="index"><g:message code="default.list.label" args="[entityName]" /></g:link></li>
				<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
			</ul>
		</div>
		<div id="show-rawData" class="content scaffold-show" role="main">
			<h1><g:message code="default.show.label" args="[entityName]" /></h1>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<ol class="property-list rawData">
			
				<g:if test="${rawDataInstance?.result}">
				<li class="fieldcontain">
					<span id="result-label" class="property-label"><g:message code="rawData.result.label" default="Result" /></span>
					
						<span class="property-value" aria-labelledby="result-label"><g:link controller="result" action="show" id="${rawDataInstance?.result?.id}">${rawDataInstance?.result?.encodeAsHTML()}</g:link></span>
					
				</li>
				</g:if>
			
				<g:if test="${rawDataInstance?.value}">
				<li class="fieldcontain">
					<span id="value-label" class="property-label"><g:message code="rawData.value.label" default="Value" /></span>
					
						<span class="property-value" aria-labelledby="value-label"><g:fieldValue bean="${rawDataInstance}" field="value"/></span>
					
				</li>
				</g:if>
			
				<g:if test="${rawDataInstance?.well}">
				<li class="fieldcontain">
					<span id="well-label" class="property-label"><g:message code="rawData.well.label" default="Well" /></span>
					
						<span class="property-value" aria-labelledby="well-label"><g:link controller="well" action="show" id="${rawDataInstance?.well?.id}">${rawDataInstance?.well?.encodeAsHTML()}</g:link></span>
					
				</li>
				</g:if>
			
			</ol>
			<g:form url="[resource:rawDataInstance, action:'delete']" method="DELETE">
				<fieldset class="buttons">
					<g:link class="edit" action="edit" resource="${rawDataInstance}"><g:message code="default.button.edit.label" default="Edit" /></g:link>
					<g:actionSubmit class="delete" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:form>
		</div>
	</body>
</html>
