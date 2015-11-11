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
.controller('MainCtrl', ["$scope", "$http", "$filter", "$location", "d3", "MonthIndex",
  function ($scope, $http, $filter, $location, d3, MonthIndex) {
    $scope.display = {
      cursor: []
    };


    $scope.log = {

      // Source of the log file
      //src: 'http://localhost:3000/files/access.log',
      src: 'http://localhost:8008/collections/MetricAggregatesDailyView/AggregateId',
      //src: 'http://metrics-datasync-service.15.126.130.219.xip.io/collections/MetricAggregatesDailyView/AggregateId',

      // Data entries
      data: [],

      env: 'all',

      showChart: true,

      startDate: '',

      endDate: ''

    };

    function loadData(src)
    {
      $http
      .jsonp(src)
      .success(function (data) {
        $scope.originalData = data;
        filterData();
      }).error(function(data, status, headers, config){
        throw new Error('Something went wrong...'+status);
      });
    }

    function filterData()
    {
      var sf = $filter('uppercase');
      var data = $scope.originalData.filter(function(e){
          return $scope.log.env =='all' || sf(e.Instance) === sf($scope.log.env);
      });
      var grouped = data.map(function(d){
        return{
          x: new Date(d.YearName, MonthIndex(d.MonthName), d.DayOfMonth),
          y: d.MetricValue - 0
        }
      });
      //combined the same date data
      var results = [];
      var keys = {};
      for(var i=0; i<grouped.length; i++)
      {
        if(angular.isUndefined(keys[grouped[i].x])){
          keys[grouped[i].x] = results.length;
          results.push(grouped[i]);
        }
        else{
          var index = keys[grouped[i].x];
          results[index].y = results[index].y + grouped[i].y;
        }
      }
      // Use the grouped & uniqued data for the chart
      results.sort(function(a,b){
        if(a.x > b.x) return 1;
        else if(a.x < b.x) return -1;
        else{
          console.log("error, should not include same date");
          return 0;
        }
      })
      console.log(results);
      $scope.log.showChart = results.length && results.length > 0;
      $scope.display.date = d3.extent(results, function(d) { return d.x; });
      $scope.log.data = results;
    }

    $scope.chartTitle = 'Total Messages Sent';

    $scope.$watch(function () {
      return $location.path();
    }, function (newPath) {
      var pathIndex = ['/1','/2','/5','/6','/7','/8'];
      var pathName = ['Total Messages Sent','Requests By CompanyCode','Onboarded People','Messages By Receiver Type and Status','Requests By External System Type','Requests By External System Type and Status'];
      if(newPath != '' && pathIndex.indexOf(newPath) >= 0){
        $scope.display = {
          cursor: []
        };
        $scope.chartTitle = pathName[pathIndex.indexOf(newPath)];
        loadData($scope.log.src + newPath+'?callback=JSON_CALLBACK');
      }
      else{
        $scope.chartTitle = pathName[0];
        loadData($scope.log.src + '/1?callback=JSON_CALLBACK');
      }
    });

<<<<<<< Updated upstream
    $scope.changeEnvFunc = function(newEnv){
      $scope.log.env = newEnv;
      filterData();
    }
  }
]);
=======
function onChangeEvn(evnname) {
    console.log(evnname);
    //$http({
    //    url: 'http://localhost:8008/collections/MetricAggregatesDailyView/Clean',
    //    method: 'DELETE'
    //}).success(function (data, header, config, status) {
    //    alert(JSON.stringify(data));

    //}).error(function (data, header, config, status) {
    //    //´¦ÀíÏìÓ¦Ê§°Ü
    //});
}
>>>>>>> Stashed changes
