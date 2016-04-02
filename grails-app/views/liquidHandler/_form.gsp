<%@ page import="edu.harvard.capstone.editor.LiquidHandler" %>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'name', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandler.name.label" default="Name" />
        </label>
        <g:textField name="name" required="" class="form-control" value="${liquidHandlerInstance?.name}"/>
    </div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'inputPlateId', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandler.inputPlateId.label" default="InputPlateId" />
        </label>
        <g:textField name="inputPlateId" required="" class="form-control" value="${liquidHandlerInstance?.inputPlateId}"/>
    </div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'inputWell', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.inputWell.label" default="InputWell" />
        </label>
        <g:textField name="inputWell" required="" class="form-control" value="${liquidHandlerInstance?.inputWell}"/>
    </div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'inputDose', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.inputDose.label" default="InputDose" />
        </label>
        <g:textField name="inputDose" required="" class="form-control" value="${liquidHandlerInstance?.inputDose}"/>
    </div>
</div>


<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'outputPlateId', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.outputPlateId.label" default="OutputPlateId" />
        </label>
        <g:textField name="outputPlateId" required="" class="form-control" value="${liquidHandlerInstance?.outputPlateId}"/>
    </div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'outputWell', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.outputWell.label" default="OutputWell" />
        </label>
        <g:textField name="outputWell" required="" class="form-control" value="${liquidHandlerInstance?.outputWell}"/>
    </div>
</div>

<div class="col-sm-6 fieldcontain ${hasErrors(bean: liquidHandlerInstance, field: 'outputDose', 'error')} required">
    <div class="form-group">
        <label for="name">
            <g:message code="liquidHandlerInstance.outputDose.label" default="OutputDose" />
        </label>
        <g:textField name="outputDose" required="" class="form-control" value="${liquidHandlerInstance?.outputDose}"/>
    </div>
</div>


