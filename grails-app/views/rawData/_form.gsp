<%@ page import="edu.harvard.capstone.result.RawData" %>



<div class="fieldcontain ${hasErrors(bean: rawDataInstance, field: 'result', 'error')} required">
	<label for="result">
		<g:message code="rawData.result.label" default="Result" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="result" name="result.id" from="${edu.harvard.capstone.result.Result.list()}" optionKey="id" required="" value="${rawDataInstance?.result?.id}" class="many-to-one"/>

</div>

<div class="fieldcontain ${hasErrors(bean: rawDataInstance, field: 'value', 'error')} required">
	<label for="value">
		<g:message code="rawData.value.label" default="Value" />
		<span class="required-indicator">*</span>
	</label>
	<g:field name="value" value="${fieldValue(bean: rawDataInstance, field: 'value')}" required=""/>

</div>

<div class="fieldcontain ${hasErrors(bean: rawDataInstance, field: 'well', 'error')} required">
	<label for="well">
		<g:message code="rawData.well.label" default="Well" />
		<span class="required-indicator">*</span>
	</label>
	<g:select id="well" name="well.id" from="${edu.harvard.capstone.editor.Well.list()}" optionKey="id" required="" value="${rawDataInstance?.well?.id}" class="many-to-one"/>

</div>

