<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<title>Platify</title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h3 style="margin-left:15px">Platify: Plate, Assay, and Results Management System</h3>
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
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='experimentalPlateSet/index';">View Assays</button></li>
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='experimentalPlateSet/create';">Create New Assay</button></li>
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='experimentalPlateSet/exportPlate';">Export Plate</button></li>
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
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='experimentalPlateSet/exportTemplate';">Export Template</button></li>
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
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='equipment/index';">View Equipment</button></li>
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='equipment/create';">Create New Equipment</button></li>
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
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='scientist/index';">View Users</button></li>
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='scientist/create';">Create New User</button></li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-sm-12 content-body">
					<div class="col-sm-3">
						<div id="normPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Standard Curve</h4>
							</div>
							<div class="panel-body ">
								<ul class="list-unstyled">
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='stdCurve/show';">Normalize plate</button></li>
								</ul>
							</div>
						</div>
						<div id="normPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Dose Response Curve</h4>
							</div>
							<div class="panel-body ">
								<ul class="list-unstyled">
									<li><button type="button" class="btn btn-info btn-sm" onclick="location.href='doseResponse/show';">Dose Response</button></li>
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
