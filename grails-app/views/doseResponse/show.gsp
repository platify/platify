<%@ page import="edu.harvard.capstone.result.Result" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'result.label', default: 'Result')}" />
		<title><g:message code="default.show.label" args="[entityName]" /></title>
		<asset:stylesheet href="jquery-ui.css"/>
		<asset:stylesheet href="grid/style.css"/>
		<asset:stylesheet href="grid/slick.grid.css"/>
		<asset:stylesheet href="grid/slick-default-theme.css"/>
		<asset:stylesheet href="grid/Grid.css"/>
	</head>
	<body class="container">

		<div class="row" ng-joy-ride="startJoyRide" config="tourConfig" on-finish="onFinish()" on-skip="onFinish()">
			  <h2 class="col-md-11">Dose Response</h2>
			  <!--<button class="btn btn-link btn-lg" ng-click="startTour()"><span class="glyphicon glyphicon-question-sign"></span>-->
			  <button class="btn btn-default" ng-click="startTour()"><span class="glyphicon glyphicon-question-sign"></span> Tour
			  </button>
		</div>
		<div style="margin: 5px;" id="controls">
		  <b>Select Assay:</b>
		  <select ng-model="selectedExperiment" ng-options="opt as opt.name for opt in experiments"></select>
		</div>

		<div style="font-size: .8em; height: 600px; width: 300px; position: relative; float: left; border: 1px solid grey; margin-right: 15px; overflow-y: scroll">
		  <table id="compoundTable" class="table table-condensed">
		    <thead>
		      <th>Compound</th>
		      <th>EC50</th>
		      <th>MIN</th>
		      <th>MAX</th>
		      <th>SLOPE</th>
		    </thead>
		    <tbody>
		      <tr ng-repeat="compound in compounds"
		          ng-class="{active:  (compound.compound) == selectedCompound.compound}"
		          ng-click="selectCompound(compound)">
		        <td>{{ compound.compound }}</td>
		        <td>{{ compound.EC50 }}</td>
		        <td>{{ compound.MIN }}</td>
		        <td>{{ compound.MAX }}</td>
		        <td>{{ compound.SLOPE }}</td>
		      </tr>
		    </tbody>
		  </table>
		</div>
		<div style="width: 600px; height: 600px; float: left; position: relative">
		  <svg style="width: 600px; height: 600px" id="dr-scatter-plot"></svg>
		</div>


</body>
</html>
