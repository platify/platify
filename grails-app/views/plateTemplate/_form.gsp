<%@ page import="edu.harvard.capstone.editor.PlateTemplate" %>



<div class="fieldcontain ${hasErrors(bean: plateTemplateInstance, field: 'name', 'error')} required">
	<label for="name">
		<g:message code="plateTemplate.name.label" default="Name" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="name" required="" value="${plateTemplateInstance?.name}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: plateTemplateInstance, field: 'owner', 'error')} required">
	<label for="owner">
		<g:message code="plateTemplate.owner.label" default="Owner" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="owner" name="owner.id" from="${edu.harvard.capstone.user.User.list()}" optionKey="id" required="" value="${plateTemplateInstance?.owner?.id}" class="many-to-one"/>

</div>

