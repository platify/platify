
<%@ page import="edu.harvard.capstone.result.Result" %>
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'result.label', default: 'Result')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<!-- Left Column -->
				<div class="col-sm-2">
					<div>
					<g:select
						id="experimentSelect"
						name="name"
						from="${edu.harvard.capstone.editor.ExperimentalPlateSet.list()}"
						optionKey="id"
						optionValue="${{it.name + " - " + it.id}}"
						onChange="updatePlateList(this.value)"
					/>
					</div>
					<div>
					<select id="plateSelect" onChange="updateResults(this.value)"></select>
					</div>
				</div> <!-- Left Column END -->
				<!-- Right Column -->
				<div class="col-sm-10">
				<pre id="dump"></pre>
				</div> <!-- Right Column END -->	
			</div>
		</div>
	<asset:javascript src="result/index.js" />
	</body>
</html>
