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
							<button class="btn btn-info btn-sm" id="saveConfigToServer">Save</button>
							<button class="btn btn-info btn-sm" id="saveAsConfigToServer">Save As</button>
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
			console.log(JSON.parse(equipment));
		})
	</g:javascript>


</body>
</html>
