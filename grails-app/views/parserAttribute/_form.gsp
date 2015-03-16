<%@ page import="edu.harvard.capstone.parser.ParserAttribute" %>



<div class="fieldcontain ${hasErrors(bean: parserAttributeInstance, field: 'equipment', 'error')} required">
	<label for="equipment">
		<g:message code="parserAttribute.equipment.label" default="Equipment" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="equipment" name="equipment.id" from="${edu.harvard.capstone.parser.Equipment.list()}" optionKey="id" required="" value="${parserAttributeInstance?.equipment?.id}" class="many-to-one"/>

</div>

<div class="fieldcontain ${hasErrors(bean: parserAttributeInstance, field: 'name', 'error')} required">
	<label for="name">
		<g:message code="parserAttribute.name.label" default="Name" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="name" required="" value="${parserAttributeInstance?.name}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: parserAttributeInstance, field: 'value', 'error')} required">
	<label for="value">
		<g:message code="parserAttribute.value.label" default="Value" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="value" required="" value="${parserAttributeInstance?.value}"/>

</div>

