
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
                        <h4 class="panel-title">Mapper List<span class="pull-right"><g:link class="btn btn-info" action="create">Create Liquid Handler Mapping</g:link></span></h4>
                    </div>
                    <div class="panel-body ">
                        <div id="list-scientist" class="content scaffold-list" role="main">
                            <table class="table table-striped table-hover">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Url</th>
                                    <th>Input Plates Count</th>
                                    <th>Output Plates Count</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                <g:each in="${liquidHandlerInstanceList}" status="i" var="liquidHandlerInstance">
                                    <tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                                        <td>${liquidHandlerInstance.id}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "name")}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "url")}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "inputPlatesCount")}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "outputPlatesCount")}</td>
                                        <td>${fieldValue(bean: liquidHandlerInstance, field: "configStatus")}</td>
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
