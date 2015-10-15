/* src/app.js */
// Application Module 
angular.module('myApp', ['myChart'])

// Main application controller
// .controller('MainCtrl', ["$scope", "d3", "SimpleHttpLoader", "StringParser", "Classifier",
//   function ($scope, d3, SimpleHttpLoader, StringParser, Classifier) {
.controller('MainCtrl', ["$scope", "$http", "d3", "SimpleHttpLoader",
  function ($scope, $http, d3, SimpleHttpLoader) {
    $scope.display = {
      cursor: []
    };

    $scope.log = {

      // Source of the log file
      //src: 'http://localhost:3000/files/access.log',
      src: 'http://localhost:8008/collections/MetricAggregatesDailyView/AggregateId/7?callback=JSON_CALLBACK',

      // Data entries
      data: [],

    };

    

    $http
        .jsonp($scope.log.src)
        .success(function (data) {
          console.log(data);
          var grouped = data.map(function(d){
            var months = ['August', 'September'];
            return{
              x: new Date(d.YearName, months.indexOf(d.MonthName) + 7, d.DayOfMonth),
              y: d.MetricValue - 0
            }
          });

          // Use the grouped data for the chart
          $scope.log.data = grouped;
        }).error(function(data, status, headers, config){
          throw new Error('Something went wrong...'+status);
        });
  }
]);