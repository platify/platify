
<%@ page import="edu.harvard.capstone.user.Scientist" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'scientist.label', default: 'Scientist')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<!-- Left Column -->
				<div class="col-sm-2">
					<div class="nav" role="navigation">
						<ul class="nav nav-pills nav-stacked">
							<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
							<li class="active"><g:link class="create" action="index">List</g:link></li>
							<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
						</ul>			
					</div>					
				</div> <!-- Left Column END -->
				<!-- Right Column -->
				<div class="col-sm-9">
					<div id="list-scientist" class="content scaffold-list" role="main">
						<h1><g:message code="default.list.label" args="[entityName]" /></h1>
						<g:if test="${flash.message}">
							<div class="message" role="status">${flash.message}</div>
						</g:if>
						<table class="table table-striped table-hover">
						<thead>
								<tr>
									<g:sortableColumn property="id" title="#" />

									<g:sortableColumn property="firstName" title="${message(code: 'scientist.firstName.label', default: 'First Name')}" />
									
									<g:sortableColumn property="lastName" title="${message(code: 'scientist.lastName.label', default: 'Last Name')}" />
								
									<g:sortableColumn property="email" title="${message(code: 'scientist.email.label', default: 'Email')}" />
																
									<th>Role</th>

									<th>Action</th>
								
								</tr>
							</thead>
							<tbody>
							<g:each in="${scientistInstanceList}" status="i" var="scientistInstance">
								
								<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
								
									<td>${scientistInstance.id}</td>

									<td>${fieldValue(bean: scientistInstance, field: "firstName")}</td>

									<td>${fieldValue(bean: scientistInstance, field: "lastName")}</td>
								
									<td>${fieldValue(bean: scientistInstance, field: "email")}</td>
								
									<td>${scientistInstance?.authorities.collect{it.authority}.join(', ')}</td>

									<td>
										<g:link id="${scientistInstance.id}" action="show"><i class="fa fa-eye user-view"></i></g:link>
									</td>
								
								</tr>

							</g:each>
							</tbody>
						</table>
						<ul class="pagination">
							<li><g:paginate total="${scientistInstanceCount ?: 0}" /></li>
						</ul>
					</div>	
				</div> <!-- Right Column END -->	
			</div>
		</div>
				
		
		
	</body>
</html>
