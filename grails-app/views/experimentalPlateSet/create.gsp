<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'Experiment')}" />
		<title><g:message code="default.create.label" args="[entityName]" /></title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<!-- Left Column -->
				<div class="col-sm-2">
					<div class="nav" role="navigation">
						<ul class="nav nav-pills nav-stacked">
							<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
							<li><g:link class="create" action="index">List</g:link></li>
							<li class="active"><a href="#"><g:message code="default.new.label" args="[entityName]" /></a></li>
						</ul>			
					</div>					
				</div> <!-- Left Column END -->
				<!-- Right Column -->
				<div class="col-sm-9">
					<div id="create-scientist" class="content scaffold-create" role="main">
						<h1><g:message code="default.create.label" args="[entityName]" /></h1>
						<g:if test="${flash.message}">
						<div class="message" role="status">${flash.message}</div>
						</g:if>
						<g:hasErrors bean="${experimentalPlateSetInstance}">
						<ul class="errors" role="alert">
							<g:eachError bean="${experimentalPlateSetInstance}" var="error">
							<li <g:if test="${error in org.springframework.validation.FieldError}">data-field-id="${error.field}"</g:if>><g:message error="${error}"/></li>
							</g:eachError>
						</ul>
						</g:hasErrors>
						<g:form url="[resource:experimentalPlateSetInstance, action:'save']" >
							<fieldset class="form">
								<g:render template="form"/>
							</fieldset>
							<fieldset class="buttons col-sm-12">
								<g:submitButton name="create" class="save btn btn-default pull-right" value="${message(code: 'default.button.create.label', default: 'Create')}" />
							</fieldset>
						</g:form>
					</div>
				</div> <!-- Right Column END -->	
			</div>
		</div>		
	</body>
</html>
