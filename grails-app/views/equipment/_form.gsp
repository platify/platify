<%@ page import="edu.harvard.capstone.parser.Equipment" %>



<div class="fieldcontain ${hasErrors(bean: equipmentInstance, field: 'name', 'error')} required">
	<label for="name">
		<g:message code="equipment.name.label" default="Name" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="name" required="" value="${equipmentInstance?.name}"/>

</div>

