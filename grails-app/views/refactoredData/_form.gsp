<%@ page import="edu.harvard.capstone.result.RefactoredData" %>



<div class="fieldcontain ${hasErrors(bean: refactoredDataInstance, field: 'result', 'error')} required">
	<label for="result">
		<g:message code="refactoredData.result.label" default="Result" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="result" name="result.id" from="${edu.harvard.capstone.result.Result.list()}" optionKey="id" required="" value="${refactoredDataInstance?.result?.id}" class="many-to-one"/>

</div>

<div class="fieldcontain ${hasErrors(bean: refactoredDataInstance, field: 'value', 'error')} required">
	<label for="value">
		<g:message code="refactoredData.value.label" default="Value" />
		<span class="required-indicator">*</span>
	</label>
	<g:field name="value" value="${fieldValue(bean: refactoredDataInstance, field: 'value')}" required=""/>

</div>

<div class="fieldcontain ${hasErrors(bean: refactoredDataInstance, field: 'well', 'error')} required">
	<label for="well">
		<g:message code="refactoredData.well.label" default="Well" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="well" name="well.id" from="${edu.harvard.capstone.editor.Well.list()}" optionKey="id" required="" value="${refactoredDataInstance?.well?.id}" class="many-to-one"/>

</div>

