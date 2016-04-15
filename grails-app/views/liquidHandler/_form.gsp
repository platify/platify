<%@ page import="edu.harvard.capstone.editor.LiquidHandler" %>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'name', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.name.label" default="Name" />
        </label>
        <g:textField name="name" required="" class="form-control" value="${liquidHandlerInstance?.name}"/>
    </div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'url', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.url.label" default="Liquid Handler Service URL" />
        </label>
        <g:textField name="url" required="" class="form-control" value="${liquidHandlerInstance?.url}"/>
    </div>
</div>

<div class="hidden col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'inputPlatesCount', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.inputPlatesCount.label" default="" />
        </label>
        <g:textField name="inputPlatesCount" required="" class="form-control" value="-1"/>
    </div>
</div>

<div class="hidden col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'outputPlatesCount', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.outputPlatesCount.label" default="outputPlatesCount" />
        </label>
        <g:textField name="outputPlatesCount" required="" class="form-control" value="-1"/>
    </div>
</div>

<div class="hidden col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'configStatus', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.configStatus.label" default="configStatus" />
        </label>
        <g:textField name="configStatus" required="" class="form-control" value="In progress..."/>
    </div>
</div>