<%@ page import="edu.harvard.capstone.editor.Well" %>



<div class="fieldcontain ${hasErrors(bean: wellInstance, field: 'column', 'error')} required">
	<label for="column">
		<g:message code="well.column.label" default="Column" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="column" required="" value="${wellInstance?.column}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: wellInstance, field: 'plate', 'error')} required">
	<label for="plate">
		<g:message code="well.plate.label" default="Plate" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="plate" name="plate.id" from="${edu.harvard.capstone.editor.PlateTemplate.list()}" optionKey="id" required="" value="${wellInstance?.plate?.id}" class="many-to-one"/>

</div>

<div class="fieldcontain ${hasErrors(bean: wellInstance, field: 'row', 'error')} required">
	<label for="row">
		<g:message code="well.row.label" default="Row" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="row" required="" value="${wellInstance?.row}"/>

</div>

