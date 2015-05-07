
<%@ page import="edu.harvard.capstone.parser.Equipment" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'equipment.label', default: 'Equipment')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<div class="col-sm-12 content-body">
					<g:form action="index" class="form-inline" >
						<h3 style="margin-left:15px">Equipment List 
							<span class="pull-right">
								<input class="form-control search" type="text" name="parseName" value="${params.parseName}" />
				        		<input class="btn btn-info btn-sm" type="submit" value="Search by Name" />
				        	</span>
				        </h3>
						<ol class="breadcrumb">
							<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
							<li>Equipment List</li>
						</ol>
					</g:form>
					
					<!-- Right Column -->
					<div class="col-sm-12">
						<div id="equipementPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Equipment List<span class="pull-right"><g:link class="create" action="create" class="btn btn-info btn-xs"><g:message code="default.new.label" args="[entityName]" /></g:link></span></h4>
							</div>
							<div class="panel-body ">
								<div id="list-scientist" class="content scaffold-list" role="main">
									
									<g:if test="${flash.message}">
										<div class="message" role="status">${flash.message}</div>
									</g:if>
									
									<table class="table table-striped table-hover">
									<thead>
											<tr>
												<g:sortableColumn property="id" title="#" />
			
												<g:sortableColumn property="name" title="${message(code: 'equipment.name.label', default: 'Name')}" />
												
												<g:sortableColumn property="machineName" title="${message(code: 'equipment.machine.label', default: 'Machine')}" />
											
												<g:sortableColumn property="description" title="${message(code: 'equipment.description.label', default: 'Description')}" />
			
												<g:sortableColumn property="dateCreated" title="${message(code: 'equipment.date.label', default: 'Date')}" />
																			
												<th>Update</th>
												<th>Delete</th>
											
											</tr>
										</thead>
										<tbody>
										<g:each in="${equipmentInstanceList}" status="i" var="equipmentInstance">
											
											<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
											
												<td>${equipmentInstance.id}</td>
			
												<td>${fieldValue(bean: equipmentInstance, field: "name")}</td>
			
												<td>${fieldValue(bean: equipmentInstance, field: "machineName")}</td>
											
												<td>${fieldValue(bean: equipmentInstance, field: "description")}</td>
			
												<td>${fieldValue(bean: equipmentInstance, field: "dateCreated")}</td>
											
												<td>
													<g:link id="${equipmentInstance.id}" action="load"><button class="btn btn-info btn-xs">View</button></g:link>
												</td>	
			
												<td>
													<g:if test="${equipmentInstance?.canUpdate()}">
														<g:link id="${equipmentInstance.id}" action="erase"><button class="btn btn-danger btn-xs">Delete</button></g:link>
													</g:if>
													<g:if test="${!equipmentInstance?.canUpdate()}">
														<button class="btn btn-xs">--NA--</button>
													</g:if>	
												</td>	
											
											</tr>
			
										</g:each>
										</tbody>
									</table>
									<ul class="pagination">
										<li><g:paginate total="${equipmentInstanceCount ?: 0}" /></li>
									</ul>
								</div>	
							</div>
						</div>
					</div> <!-- Right Column END -->
				</div>
			</div>
		</div>
	</body>
</html>
