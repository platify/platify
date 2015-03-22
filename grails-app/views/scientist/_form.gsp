<%@ page import="edu.harvard.capstone.user.Scientist" %>



<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'username', 'error')} required">
	<label for="username">
		<g:message code="scientist.username.label" default="Username" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="username" required="" value="${scientistInstance?.username}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'password', 'error')} required">
	<label for="password">
		<g:message code="scientist.password.label" default="Password" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="password" required="" value="${scientistInstance?.password}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'email', 'error')} required">
	<label for="email">
		<g:message code="scientist.email.label" default="Email" />
		<span class="required-indicator">*</span>
	</label>
	<g:field type="email" name="email" required="" value="${scientistInstance?.email}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'accountExpired', 'error')} ">
	<label for="accountExpired">
		<g:message code="scientist.accountExpired.label" default="Account Expired" />
		
	</label>
	<g:checkBox name="accountExpired" value="${scientistInstance?.accountExpired}" />

</div>

<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'accountLocked', 'error')} ">
	<label for="accountLocked">
		<g:message code="scientist.accountLocked.label" default="Account Locked" />
		
	</label>
	<g:checkBox name="accountLocked" value="${scientistInstance?.accountLocked}" />

</div>

<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'enabled', 'error')} ">
	<label for="enabled">
		<g:message code="scientist.enabled.label" default="Enabled" />
		
	</label>
	<g:checkBox name="enabled" value="${scientistInstance?.enabled}" />

</div>

<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'firstName', 'error')} required">
	<label for="firstName">
		<g:message code="scientist.firstName.label" default="First Name" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="firstName" required="" value="${scientistInstance?.firstName}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'lastName', 'error')} required">
	<label for="lastName">
		<g:message code="scientist.lastName.label" default="Last Name" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="lastName" required="" value="${scientistInstance?.lastName}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: scientistInstance, field: 'passwordExpired', 'error')} ">
	<label for="passwordExpired">
		<g:message code="scientist.passwordExpired.label" default="Password Expired" />
		
	</label>
	<g:checkBox name="passwordExpired" value="${scientistInstance?.passwordExpired}" />

</div>

