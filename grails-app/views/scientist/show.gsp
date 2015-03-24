
<%@ page import="edu.harvard.capstone.user.Scientist" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'scientist.label', default: 'Scientist')}" />
		<title><g:message code="default.show.label" args="[entityName]" /></title>
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
					<div id="show-scientist" class="content scaffold-show" role="main">
						<h1><g:message code="default.show.label" args="[entityName]" /></h1>
						<g:if test="${flash.message}">
						<div class="message" role="status">${flash.message}</div>
						</g:if>

						<div class="form-group">
						    <label class="control-label"><g:message code="scientist.firstName.label" default="First Name" /></label>
						    <div class="">
						      <p class="form-control-static"><g:fieldValue bean="${scientistInstance}" field="firstName"/></p>
						    </div>
						</div>


						<div class="form-group">
						    <label class="control-label"><g:message code="scientist.lastName.label" default="Last Name" /></label>
						    <div class="">
						      <p class="form-control-static"><g:fieldValue bean="${scientistInstance}" field="lastName"/></p>
						    </div>
						</div>


						<div class="form-group">
						    <label class="control-label"><g:message code="scientist.email.label" default="Email" /></label>
						    <div class="">
						      <p class="form-control-static"><g:fieldValue bean="${scientistInstance}" field="email"/></p>
						    </div>
						</div>

						<div class="form-group">
						    <label class="control-label">Role</label>
						    <div class="">
						      <p class="form-control-static">${scientistInstance?.authorities.collect{it.authority}.join(', ')}</p>
						    </div>
						</div>

						<div class="col-xs-12">
							<div class="pull-right">
								<g:form url="[resource:scientistInstance, action:'delete']" method="DELETE">
									<fieldset class="buttons">
										<g:if test="${Scientist.findByEmail(sec?.loggedInUserInfo(field:'username'))?.id == scientistInstance?.id || Scientist.findByEmail(sec?.loggedInUserInfo(field:'username'))?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}}">
											<g:link class="btn btn-default" action="edit" resource="${scientistInstance}"><g:message code="default.button.edit.label" default="Edit" /></g:link>
										</g:if>
										<sec:ifAnyGranted roles='ROLE_ADMIN, ROLE_SUPER_ADMIN'>
											<g:actionSubmit class="btn btn-default" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
										</sec:ifAnyGranted>
									</fieldset>
								</g:form>
								
							</div>
						</div>
					</div>					

				</div> <!-- Right Column END -->	
			</div>
		</div>


	</body>
</html>
