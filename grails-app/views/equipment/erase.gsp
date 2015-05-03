<%@ page import="edu.harvard.capstone.parser.Equipment" %>
<!DOCTYPE html>
<html>
<head lang="en">
	<meta name="layout" content="main">
	<g:set var="entityName" value="${message(code: 'equipment.label', default: 'Equipment')}" />
	<title><g:message code="default.edit.label" args="[entityName]" /></title>

    <asset:stylesheet href="jquery-ui.css"/>
    <asset:stylesheet href="grid/style.css"/>
    <asset:stylesheet href="grid/slick.grid.css"/>
    <asset:stylesheet href="grid/slick-default-theme.css"/>
    <asset:stylesheet href="grid/Grid.css"/>
    <asset:stylesheet href="selectize.css"/>

</head>
<body class="container">
	<div class=""></div>

	<div class="content-fluid ">
		<div class="row">
			<div class="col-sm-12 content-body">
				<div>
					<div class="pull-left">
						<h2>
							Equipment: <span>${equipmentInstance?.name}</span>	
						</h2>
					</div>
					<div class="pull-right">
						<h2>
							<button	id="importResults" style="display:none;" ></button>
							<button style="display:none;" id="saveConfigToServer"></button>
							<button style="display:none;" id="saveAsConfigToServer"></button>
							<g:form url="[resource:equipmentInstance, action:'delete']" method="DELETE">
							<sec:ifAnyGranted roles='ROLE_ADMIN, ROLE_SUPER_ADMIN'>
								<g:actionSubmit class="btn btn-danger btn-sm" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
							</sec:ifAnyGranted>
							</g:form>
						</h2>
					</div>
				</div>			
				<g:render template="parser"/>
			</div> <!-- Right Column END -->	
		</div>
	</div>	
	<g:javascript>
		$(function() {
			canUpdate = ${equipmentInstance?.canUpdate()};
			$('#parsingId').val("${equipmentInstance?.id}");
			equipment = "${equipmentInstance?.config}";
		})
	</g:javascript>


</body>
</html>
