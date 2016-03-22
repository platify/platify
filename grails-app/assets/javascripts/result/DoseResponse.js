'use strict';

/**
 * @ngdoc function
 * @name we99App.controller:DoseResponseCntrl
 * @description
 *
 * # DoseResponseCntrl
 * Controller of the we99App
 */
angular.module('we99App')
  .controller('DoseResponseCntrl', ["$q", "$scope", "RestService","TourConstants",
    function ($q, $scope, RestService,TourConstants) {

    var v = new DataVis();

    // Retrieve list of assays
    RestService.getExperiments()
      .success(function (response) {

        // Assay drop down.
        $scope.experiments = response.values;
        $scope.selectedExperiment = $scope.experiments[0];

        $scope.$watch('selectedExperiment', function(newValue) {

          var experimentId = newValue.id;
          RestService.getDoseResponseData(experimentId)
            .success(function(response){

              // Compound setup.
              $scope.compounds = v.convertDoseResponseData(response.values);
              $scope.selectedCompound = $scope.compounds.filter(function(d){return d.hasCurve;})[0];
              $scope.selectCompound = function(compound){
                $scope.selectedCompound = compound;
                fullDisplayRefresh();
              };

              fullDisplayRefresh();

            }).error(function(){
              $scope.errorText='Failed to load dose response data.';
            });

        });


      }).error(function(){
        $scope.errorText='Failed to load assay data.';
      });

    /**
     * Handles all of the rendering logic for handling a complete redraw of the screen.
     */
    function fullDisplayRefresh(){

      var displayBoxLocation = "#dr-scatter-plot";

      // Wipe out any current content
      d3.select(displayBoxLocation).html("");

      // On click callback function for a scatter plot point.
      var onClick = function(d) {

        // Toggle well point.
        var toggle = null;
        $scope.selectedCompound.wells.forEach(function(dataPoint){
          if(dataPoint.wellIndex == d.wellIndex){
            dataPoint.included = !dataPoint.included;
            toggle = dataPoint.included;
          }
        });

        // Helper function for converting toggle (true/false) to a string.
        function _toString(d){
          if(d){ return "INCLUDED"; }
          else{ return "EXCLUDED"; }
        }

        // Register update with the server.
        RestService.updateDoseResponseResult($scope.selectedExperiment.id, {
            doseId: d.wellIndex,
            plateId: d.plateId,
            status: _toString(toggle)
          }).success(function(d){
            var data = v.convertDoseResponseData([d])[0];
            for(var i = 0; i<$scope.compounds.length; i++){
              if($scope.compounds[i].compound === data.compound){
                $scope.compounds[i = data];
              }
            }
            $scope.selectedCompound = data;
            fullDisplayRefresh();
          }).error(function(){
            $scope.errorText='Failed to load dose response data.';
          });

      };
      //for testing purposes, make the click function accessible to angular scope
      $scope.doClick=onClick;

      // Normal set of parameters.
      var scatterPlotParameters = {
        location: displayBoxLocation,
        data: $scope.selectedCompound.wells,
        xScaleIsDate: false,
        onCellClick: onClick,
        axisTitle: {
          x: "Dose",
          y: "Response"
        },
        scaleY: {
          min: d3.min($scope.selectedCompound.wells.map(function(d) {return d.value;})),
          max: d3.max($scope.selectedCompound.wells.map(function(d) {return d.value;}))
        }
      };

      // If the parameter has a curve then use the curve as well.
      if($scope.selectedCompound.hasCurve) {
        scatterPlotParameters.linePoints = $scope.selectedCompound.curve;
      }

      v.renderScatterPlot(scatterPlotParameters);

    }
      //=== Tour Settings ===

      $scope.startTour=function(){
        $scope.tourConfig=TourConstants.cleanTourConfig(TourConstants.doseResponseTour);
        if($scope.tourConfig.length>=1)
          $scope.startJoyRide=true;
      };

  }]);