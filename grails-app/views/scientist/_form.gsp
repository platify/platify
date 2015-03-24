<%@ page import="edu.harvard.capstone.user.Scientist" %>



<div class="col-sm-6 fieldcontain ${hasErrors(bean: scientistInstance, field: 'firstName', 'error')} required">
	<div class="form-group">
		<label for="firstName">
			<g:message code="scientist.firstName.label" default="First Name" />
			<span class="required-indicator">*</span>
		</label>
		<g:textField name="firstName" required="" class="form-control" value="${scientistInstance?.firstName}"/>
	</div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: scientistInstance, field: 'lastName', 'error')} required">
	<div class="form-group">
		<label for="lastName">
			<g:message code="scientist.lastName.label" default="Last Name" />
			<span class="required-indicator">*</span>
		</label>
		<g:textField name="lastName" required="" class="form-control" value="${scientistInstance?.lastName}"/>
	</div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: scientistInstance, field: 'password', 'error')} required">
	<div class="form-group">
		<label for="password">
			<g:message code="scientist.password.label" default="Password" />
			<span class="required-indicator">*</span>
		</label>
		<g:passwordField name="password" required="" class="form-control" value="${scientistInstance?.password}"/>
	</div>
</div>


<div class="col-sm-6 fieldcontain ${hasErrors(bean: scientistInstance, field: 'email', 'error')} required">
	<div class="form-group">
		<label for="email">
			<g:message code="scientist.email.label" default="Email" />
			<span class="required-indicator">*</span>
		</label>
		<g:field type="email" name="email" required="" class="form-control" value="${scientistInstance?.email}"/>
	</div>
</div>

