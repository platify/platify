<%@ page import="edu.harvard.capstone.user.Scientist" %>


<!DOCTYPE html>
<!--[if lt IE 7 ]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="no-js ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class="no-js"><!--<![endif]-->
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title><g:layoutTitle default="Grails"/></title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="shortcut icon" href="${resource(dir: 'images', file: 'favicon.ico')}" type="image/x-icon">
		<link rel="apple-touch-icon" href="${resource(dir: 'images', file: 'apple-touch-icon.png')}">
		<link rel="apple-touch-icon" sizes="114x114" href="${resource(dir: 'images', file: 'apple-touch-icon-retina.png')}">

		<asset:stylesheet href="font-awesome.min.css"/>
		<asset:stylesheet href="custom.css"/>
		<asset:javascript src="jquery-1.11.2.min.js"/>
		<g:layoutHead/>
	</head>
	<body>

		<g:set var="userObject" value="${Scientist.findByEmail(sec?.loggedInUserInfo(field:'username'))}"/>

		<header>
			<!--<nav class="navbar navbar-inverse"> -->
			<nav class="navbar-inverse">
			  <div class="container-fluid">
			    <!-- Brand and toggle get grouped for better mobile display -->
			    <div class="navbar-header">
			      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#header-navbar">
			        <span class="sr-only">Toggle navigation</span>
			        <span class="icon-bar"></span>
			        <span class="icon-bar"></span>
			        <span class="icon-bar"></span>
			      </button>
			      <a class="navbar-brand" href="${createLink(uri: '/')}">SurNorte</a>
			    </div>

			    <!-- Collect the nav links, forms, and other content for toggling -->
			    <div class="collapse navbar-collapse" id="header-navbar">
			    	<sec:ifLoggedIn>
						<ul class="nav navbar-nav">
							<li class="plate-editor">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Assays<span class="caret"></span></a>
								<ul class="dropdown-menu" role="menu">
									<li><g:link controller="experimentalPlateSet" action="index">View Assays</g:link></li>
									<li class="divider"></li>
									<li><g:link controller="experimentalPlateSet" action="create">Create Assay</g:link></li>
								</ul>
							</li>
							<li class="output-parser">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Output Parser <span class="caret"></span></a>
								<ul class="dropdown-menu" role="menu">
									<li><g:link controller="equipment" action="index">Equipment</g:link></li>
								</ul>
							</li>
							<sec:ifAnyGranted roles='ROLE_ADMIN, ROLE_SUPER_ADMIN'>
								<li class="admin" class="dropdown">
								  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Admin <span class="caret"></span></a>
								  <ul class="dropdown-menu" role="menu">
								    <li><g:link controller="scientist" action="index">Users</g:link></li>
								  </ul>
								</li>
							</sec:ifAnyGranted>
						</ul>
					</sec:ifLoggedIn>

			      <ul class="nav navbar-nav navbar-right">
			        <sec:ifLoggedIn>
				      	<li class="dropdown user">
				          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">${userObject?.firstName} <span class="caret"></span></a>
				          <ul class="dropdown-menu" role="menu">
				            <li><a href="#">Profile</a></li>
				            <li><g:link controller="logout">Logout</g:link></li>
				          </ul>
				        </li>
				    </sec:ifLoggedIn>
				    <sec:ifNotLoggedIn>
				    	<li class="login"><g:link controller="login">Login</g:link></li>
					</sec:ifNotLoggedIn>
			      </ul>
			    </div><!-- /.navbar-collapse -->
			  </div><!-- /.container-fluid -->
			</nav>
		</header>
		<g:layoutBody/>

		<g:if env="production">
		    <!-- Markup to include ONLY when in production -->
		    <g:javascript>
				var hostname = "/capstone";
		    </g:javascript>
		</g:if>
		<g:else>
		    <g:javascript>
				var hostname = "/capstone";
		    </g:javascript>
		</g:else>

		<!-- main JS libs -->
		<asset:javascript src="modernizr.min.js"/>
		<asset:javascript src="bootstrap.js"/>

	</body>
</html>
