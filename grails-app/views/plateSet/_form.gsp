<%@ page import="edu.harvard.capstone.editor.PlateSet" %>



<div class="fieldcontain ${hasErrors(bean: plateSetInstance, field: 'assay', 'error')} required">
	<label for="assay">
		<g:message code="plateSet.assay.label" default="Assay" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="assay" required="" value="${plateSetInstance?.assay}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: plateSetInstance, field: 'experiment', 'error')} required">
	<label for="experiment">
		<g:message code="plateSet.experiment.label" default="Experiment" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="experiment" name="experiment.id" from="${edu.harvard.capstone.editor.ExperimentalPlateSet.list()}" optionKey="id" required="" value="${plateSetInstance?.experiment?.id}" class="many-to-one"/>

</div>

<div class="fieldcontain ${hasErrors(bean: plateSetInstance, field: 'plate', 'error')} required">
	<label for="plate">
		<g:message code="plateSet.plate.label" default="Plate" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="plate" name="plate.id" from="${edu.harvard.capstone.editor.PlateTemplate.list()}" optionKey="id" required="" value="${plateSetInstance?.plate?.id}" class="many-to-one"/>

</div>

