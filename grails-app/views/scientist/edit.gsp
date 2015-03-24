<%@ page import="edu.harvard.capstone.user.Scientist" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'scientist.label', default: 'Scientist')}" />
		<title><g:message code="default.edit.label" args="[entityName]" /></title>
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
							<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
						</ul>			
					</div>					
				</div> <!-- Left Column END -->
				<!-- Right Column -->
				<div class="col-sm-9">
					<div id="edit-scientist" class="content scaffold-edit" role="main">
						<h1><g:message code="default.edit.label" args="[entityName]" /></h1>
						<g:if test="${flash.message}">
						<div class="message" role="status">${flash.message}</div>
						</g:if>
						<g:hasErrors bean="${scientistInstance}">
						<ul class="errors" role="alert">
							<g:eachError bean="${scientistInstance}" var="error">
							<li <g:if test="${error in org.springframework.validation.FieldError}">data-field-id="${error.field}"</g:if>><g:message error="${error}"/></li>
							</g:eachError>
						</ul>
						</g:hasErrors>
						<g:form action="update" id="${scientistInstance?.id}" method="PUT" >
							<g:hiddenField name="version" value="${scientistInstance?.version}" />
							<fieldset class="form">
							<div class="col-xs-12">
								<div class="col-sm-6 fieldcontain ${hasErrors(bean: scientistInstance, field: 'firstName', 'error')}">
									<div class="form-group">
										<label for="firstName">
											<g:message code="scientist.firstName.label" default="First Name" />
										</label>
										<g:textField name="firstName" class="form-control" value="${scientistInstance?.firstName}"/>
									</div>
								</div>								
							</div>
							<div class="col-xs-12">
								<div class="col-sm-6 fieldcontain ${hasErrors(bean: scientistInstance, field: 'lastName', 'error')}">
									<div class="form-group">
										<label for="lastName">
											<g:message code="scientist.lastName.label" default="Last Name" />
										</label>
										<g:textField name="lastName" class="form-control" value="${scientistInstance?.lastName}"/>
									</div>
								</div>								
							</div>
							<div class="col-xs-12">
								<div class="col-sm-6 fieldcontain ${hasErrors(bean: scientistInstance, field: 'password', 'error')}">
									<div class="form-group">
										<label for="password">
											<g:message code="scientist.password.label" default="Password" />
										</label>
										<g:passwordField name="password" class="form-control"/>
									</div>
								</div>								
							</div>
							<div class="col-xs-12">
								<div class="col-sm-6 fieldcontain ${hasErrors(bean: scientistInstance, field: 'email', 'error')}">
									<div class="form-group">
										<label for="email">
											<g:message code="scientist.email.label" default="Email" />
										</label>
										<g:field type="email" name="email" class="form-control" value="${scientistInstance?.email}"/>
									</div>
								</div>								
							</div>
							<sec:ifAnyGranted roles='ROLE_ADMIN, ROLE_SUPER_ADMIN'>
								<div class="col-xs-12">
									<div class="col-xs-12">
										<div class="checkbox">
										    <label>
										    	<g:if test="${ scientistInstance?.getAuthorities().any { it.authority == "ROLE_ADMIN"} }">
										    		<input type="checkbox" name="admin" id="admin" checked value="true">
										    	</g:if>
										    	<g:else>
										    		<input type="checkbox" name="admin" id="admin" value="true">
										    	</g:else>
										    	Administrator
										    </label>
										</div>
									</div>
								</div>
							</sec:ifAnyGranted>
							</fieldset>
							<div class="col-xs-12">
								<div class="pull-right">
									<fieldset class="buttons">
										<g:actionSubmit class="btn btn-default" action="update" value="${message(code: 'default.button.update.label', default: 'Update')}" />
									</fieldset>
									
								</div>
							</div>
						</g:form>
					</div>
					
				</div> <!-- Right Column END -->	
			</div>
		</div>
	</body>
</html>
