
<%@ page import="edu.harvard.capstone.editor.LiquidHandler" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main">
    <g:set var="entityName" value="${message(code: 'liquidHandler.label', default: 'Liquid Handler Mapping')}" />
    <title>Liquid Handlers</title>
</head>
<body>
<div class="content-fluid">
    <div class="row">
        <div class="col-sm-12 content-body">
            <h3 style="margin-left:15px">Liquid Handlers</h3>
            <ol class="breadcrumb">
                <li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
                <li>Liquid Handlers</li>
            </ol>
            <div class="col-sm-12">
                <div id="expDetailsPanel" class="panel panel-default">
                    <div class="panel-heading">
                        <h4 class="panel-title">Mapper List<span class="pull-right"><g:link class="btn btn-info btn-xs" action="create">Create Liquid Handler Mapping</g:link></span></h4>
                    </div>
                    <div class="panel-body ">
                        <div id="list-scientist" class="content scaffold-list" role="main">
                            <table class="table table-striped table-hover">
                                <thead>
                                <tr>
                                    <g:sortableColumn property="id" title="#" />
                                    <g:sortableColumn property="Name" title="${message(code: 'liquidHandler.name.label', default: 'Name')}" />
                                    <g:sortableColumn property="InputPlateId" title="${message(code: 'liquidHandler.inputPlateId.label', default: 'InputPlateId')}" />
                                    <g:sortableColumn property="InputWell" title="${message(code: 'liquidHandler.inputWell.label', default: 'InputWell')}" />
                                    <g:sortableColumn property="InputDose" title="${message(code: 'liquidHandler.inputDose.label', default: 'InputDose')}" />
                                    <g:sortableColumn property="OutputPlateId" title="${message(code: 'liquidHandler.outputPlateId.label', default: 'OutputPlateId')}" />
                                    <g:sortableColumn property="OutputWell" title="${message(code: 'liquidHandler.outputWell.label', default: 'OutputWell')}" />
                                    <g:sortableColumn property="OutputDose" title="${message(code: 'liquidHandler.outputDose.label', default: 'OutputDose')}" />
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                <g:each in="${liquidHandlerInstanceList}" status="i" var="liquidHandlerInstance">
                                    <tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                                        <td>${liquidHandlerInstance.id}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "Name")}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "inputPlateId")}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "inputWell")}</td>
                                        <td>${liquidHandlerInstance.owner.firstName + ' ' + liquidHandlerInstance.owner.lastName}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "dateCreated")}</td>
                                        <td>
                                            <g:link class="btn btn-info btn-xs"
                                                    id="${liquidHandlerInstance.id}"
                                                    action="showactions">Show Details</g:link>
                                            <g:link class="btn btn-info btn-xs ${disabled[liquidHandlerInstance.id]}"
                                                    id="${liquidHandlerInstance.id}"
                                                    controller="result"
                                                    action="showactions">Show Results</g:link>
                                        </td>
                                    </tr>
                                </g:each>
                                </tbody>
                            </table>
                            <ul class="pagination">
                                <li><g:paginate total="${liquidHandlerInstanceCount ?: 0}" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
