<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: experimentalPlateSetInstance, field: 'name', 'error')} required">
	<div class="form-group">
		<label for="name">
			<g:message code="experimentalPlateSet.name.label" default="Name" />
		</label>
		<g:textField name="name" required="" class="form-control" value="${experimentalPlateSetInstance?.name}"/>
	</div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: experimentalPlateSetInstance, field: 'description', 'error')} required">
	<div class="form-group">
		<label for="description">
			<g:message code="experimentalPlateSet.description.label" default="Description" />
		</label>
		<g:textArea name="description" class="form-control" value="${experimentalPlateSetInstance?.description}"/>
	</div>
</div>
