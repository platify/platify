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
					<h3 style="margin-left:15px">Home (Assay Management System Title)</h3>
					<ol class="breadcrumb">
						<li><a class="home" href="#">Home</a></li>
					</ol>
					<div class="col-sm-3">
						<div id="expPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Assays</h4>
							</div>
							<div class="panel-body ">
								<g:link class="btn btn-info btn-sm" controller="experimentalPlateSet" action="index">View Assays</g:link>
								<g:link class="btn btn-info btn-sm" controller="experimentalPlateSet" action="create">Create New Assay</g:link>
							</div>
						</div>
					</div>
					<div class="col-sm-3">
						<div id="templatePanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Plate Templates</h4>
							</div>
							<div class="panel-body ">
								<g:link class="btn btn-info btn-sm" controller="plateTemplate" action="create">Create New Template</g:link>
							</div>
						</div>
					</div>
					<div class="col-sm-3">
						<div id="parserPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Equipment</h4>
							</div>
							<div class="panel-body ">
								<g:link class="btn btn-info btn-sm" controller="equipment" action="index">View Equipment</g:link>
								<g:link class="btn btn-info btn-sm" controller="equipment" action="create">Create New Equipment</g:link>
							</div>
						</div>
					</div>
					<div class="col-sm-3">
						<div id="resultsPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Results</h4>
							</div>
							<div class="panel-body ">
								<g:link class="btn btn-info btn-sm" controller="result" action="index">View Results</g:link>
							</div>
						</div>
					</div>
					<div class="col-sm-3">
						<div id="expPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Users</h4>
							</div>
							<div class="panel-body ">
								<g:link class="btn btn-info btn-sm" controller="scientist" action="index">View Users</g:link>
								<g:link class="btn btn-info btn-sm" controller="scientist" action="create">Create New User</g:link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
