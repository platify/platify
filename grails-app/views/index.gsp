<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<title>Capstone</title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h3 style="margin-left:15px">SurNorte Assay Management System</h3>
					<ol class="breadcrumb">
						<li><a class="home" href="#">Home</a></li>
					</ol>
					<div class="col-sm-3">
						<div id="expPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Assays</h4>
							</div>
							<div class="panel-body ">
								<ul class="list-unstyled">
									<li><g:link class="btn btn-info btn-sm" controller="experimentalPlateSet" action="index">View Assays</g:link></li>
									<li><g:link class="btn btn-info btn-sm" controller="experimentalPlateSet" action="create">Create New Assay</g:link></li>
									<li><g:link class="btn btn-info btn-sm">Export Plate</g:link></li>
								</ul>
							</div>
						</div>
					</div>
					<div class="col-sm-3">
						<div id="templatePanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Plate Templates</h4>
							</div>
							<div class="panel-body ">							
								<ul class="list-unstyled">
									<li><button type="button" class="btn btn-info btn-sm" data-toggle="modal" data-target="#createTemplateModal">Create New Template</button></li>
									<li><g:link class="btn btn-info btn-sm">Export Template</g:link></li>
								</ul>
							</div>
						</div>
					</div>
					<div class="col-sm-3">
						<div id="parserPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Equipment</h4>
							</div>
							<div class="panel-body ">
								<ul class="list-unstyled">
									<li><g:link class="btn btn-info btn-sm" controller="equipment" action="index">View Equipment</g:link></li>
									<li><g:link class="btn btn-info btn-sm" controller="equipment" action="create">Create New Equipment</g:link></li>
								</ul>
							</div>
						</div>
					</div>
					<div class="col-sm-3">
						<div id="expPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Users</h4>
							</div>
							<div class="panel-body ">
								<ul class="list-unstyled">
									<li><g:link class="btn btn-info btn-sm" controller="scientist" action="index">View Users</g:link></li>
									<li><g:link class="btn btn-info btn-sm" controller="scientist" action="create">Create New User</g:link></li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<g:render template="/plateTemplate/createTemplateDialog"/>
	</body>
</html>
