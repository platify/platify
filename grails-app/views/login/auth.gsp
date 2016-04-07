<html>
<head>
	<meta name='layout' content='main'/>
	<title><g:message code="springSecurity.login.title"/></title> 
</head>

<body>

<div style="margin-top: 75px; text-align: center; margin-left: auto; margin-right: auto;">
	<h1>Login to Platify</h1>
</div>

	<div class="container" style="padding-top: 10px;">

		<div class="row">

			<div class="col-md-4 col-md-offset-4 login-container">
				
				<g:if test='${flash.message}'>
					<div class="alert alert-warning">${flash.message}</div>
				</g:if>

					<div class="inner padded">

									
						<form action='${postUrl}' method='POST' id='loginForm' class='cssform' autocomplete='off'>
							<div class="form-group">
								<label for="exampleInputEmail1">Email address</label>
							    <input tabindex="1" type="email" class="form-control" name='j_username' id='username' placeholder="Enter email">
							</div>
						    <div class="form-group">
							    <label for="exampleInputPassword1">Password</label>
							    <input tabindex="2" type="password" class="form-control" name='j_password' id='password' placeholder="Password">
						    </div>				
							<div id="remember_me_holder" class="center">
								<input tabindex="3" type='checkbox' class='chk' name='${rememberMeParameter}' id='remember_me' <g:if test='${hasCookie}'>checked='checked'</g:if>/>
								<label for='remember_me'>
									<g:message code="springSecurity.login.remember.me.label"/>
								</label>
							</div>		
							<div class="form-group">
								<input tabindex="4" class="btn btn-default pull-right" type='submit' id="submit" value='${message(code: "springSecurity.login.button")}'/>
							</div>	    			
															
								

						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
<script type='text/javascript'>
	<!--
	(function() {
		document.forms['loginForm'].elements['j_username'].focus();
	})();
	// -->
</script>
</body>
</html>