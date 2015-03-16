<%@ page import="edu.harvard.capstone.result.Result" %>



<div class="fieldcontain ${hasErrors(bean: resultInstance, field: 'description', 'error')} ">
	<label for="description">
		<g:message code="result.description.label" default="Description" />
		
	</label>
	<g:textField name="description" value="${resultInstance?.description}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: resultInstance, field: 'equipment', 'error')} required">
	<label for="equipment">
		<g:message code="result.equipment.label" default="Equipment" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="equipment" name="equipment.id" from="${edu.harvard.parser.Equipment.list()}" optionKey="id" required="" value="${resultInstance?.equipment?.id}" class="many-to-one"/>

</div>

<div class="fieldcontain ${hasErrors(bean: resultInstance, field: 'experiment', 'error')} required">
	<label for="experiment">
		<g:message code="result.experiment.label" default="Experiment" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="experiment" name="experiment.id" from="${edu.harvard.editor.ExperimentalPlateSet.list()}" optionKey="id" required="" value="${resultInstance?.experiment?.id}" class="many-to-one"/>

</div>

<div class="fieldcontain ${hasErrors(bean: resultInstance, field: 'name', 'error')} required">
	<label for="name">
		<g:message code="result.name.label" default="Name" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="name" required="" value="${resultInstance?.name}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: resultInstance, field: 'owner', 'error')} required">
	<label for="owner">
		<g:message code="result.owner.label" default="Owner" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="owner" name="owner.id" from="${edu.harvard.capstone.user.User.list()}" optionKey="id" required="" value="${resultInstance?.owner?.id}" class="many-to-one"/>

</div>

