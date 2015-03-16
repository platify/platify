<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>



<div class="fieldcontain ${hasErrors(bean: experimentalPlateSetInstance, field: 'description', 'error')} ">
	<label for="description">
		<g:message code="experimentalPlateSet.description.label" default="Description" />
		
	</label>
	<g:textField name="description" value="${experimentalPlateSetInstance?.description}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: experimentalPlateSetInstance, field: 'name', 'error')} required">
	<label for="name">
		<g:message code="experimentalPlateSet.name.label" default="Name" />
		<span class="required-indicator">*</span>
	</label>
	<g:textField name="name" required="" value="${experimentalPlateSetInstance?.name}"/>

</div>

<div class="fieldcontain ${hasErrors(bean: experimentalPlateSetInstance, field: 'owner', 'error')} required">
	<label for="owner">
		<g:message code="experimentalPlateSet.owner.label" default="Owner" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="owner" name="owner.id" from="${edu.harvard.capstone.user.User.list()}" optionKey="id" required="" value="${experimentalPlateSetInstance?.owner?.id}" class="many-to-one"/>

</div>

