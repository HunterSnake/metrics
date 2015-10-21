/* src/app.js */
// Application Module 
angular.module('myApp', ['myChart'])

.factory('MonthIndex',  function(){
  return function(monthName) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  };
})

// Main application controller
.controller('MainCtrl', ["$scope", "$http", "d3", "MonthIndex",
  function ($scope, $http, d3, MonthIndex) {
    $scope.display = {
      cursor: []
    };

    $scope.log = {

      // Source of the log file
      //src: 'http://localhost:3000/files/access.log',
      src: 'http://localhost:8008/collections/MetricAggregatesDailyView/AggregateId/1?callback=JSON_CALLBACK',
      //src: 'http://metrics-datasync-service.15.126.130.219.xip.io/collections/MetricAggregatesDailyView/AggregateId/7?callback=JSON_CALLBACK',

      // Data entries
      data: [],

    };

    $http
      .jsonp($scope.log.src)
      .success(function (data) {
        console.log(data);
        var grouped = data.map(function(d){
          var months = ['August', 'September', 'October'];
          return{
            x: new Date(d.YearName, MonthIndex(d.MonthName), d.DayOfMonth),
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