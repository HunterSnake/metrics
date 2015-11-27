/* src/app.js */
// Application Module 
angular.module('myApp', ['myChart'])
.constant('config', {
  src: 'http://localhost:8008/collections/MetricAggregatesDailyView/AggregateId',
  //src: 'http://metrics-datasync-service.15.126.133.55.xip.io/collections/MetricAggregatesDailyView/AggregateId',
  pathMap:[{path:'/1',name:'Total Messages Sent'},{path:'/2',name:'Requests By CompanyCode'},
          {path:'/5',name:'Onboarded People'},{path:'/6',name:'Messages By Receiver Type and Status'},
          {path:'/7',name:'Requests By External System Type'},{path:'/8',name:'Requests By External System Type and Status'},
          {path:'/10',name:'Onboarded Team'}],
  pieColorSet:["#2AD2C9","#FF8D6D","#614767"],
  MonthName:['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
})
.factory('myData', function(){
  return {
    originalData:[],
    data:[],
    env:'all',
    startDate:'',
    endDate:''
  }
})

.factory('appUtilities',  ['config', function(config){
  return {
    monthIndex: function(monthName) {
        return config.MonthName.indexOf(monthName);
      },
    sumGroup: function(arr, p1, psum){
      var results = [];
      var keys = {};
      for(var i=0; i<arr.length; i++)
      {
        if(angular.isUndefined(keys[arr[i][p1]])){
          keys[arr[i][p1]] = results.length;
          results.push(arr[i]);
        }
        else{
          var index = keys[arr[i][p1]];
          results[index][psum] = results[index][psum] + arr[i][psum];
        }
      }
      return results;
    }
  };
}])

// Main application controller
.controller('MainCtrl', ["$scope", "$http", "$filter", "$location", "config", "d3", "appUtilities", "myData",
  function ($scope, $http, $filter, $location, config, d3, appUtilities, myData) {
    $scope.display = {
      cursor: []
    };
    $scope.toolTip = {
      data:[]
    };

    $scope.toolTipFunc = function(data){
      $scope.toolTip.data = data;
      $scope.$apply();
    }



    $scope.pieColorSet = config.pieColorSet;

    $scope.notReady = false;
    $scope.building = function(){
      $scope.notReady = true;
    }

    $scope.showing = function(){
      $scope.notReady = false;
    }


    $scope.data = myData;

    function loadData(src)
    {
      $http
      .jsonp(src)
      .success(function (data) {
        myData.originalData = data;
        filterData();
      }).error(function(data, status, headers, cf){
        throw new Error('Something went wrong...'+status);
      });
    }

    function filterData()
    {
      var sf = $filter('uppercase');
      var data = myData.originalData.filter(function(e){
          return myData.env =='all' || sf(e.Instance) === sf(myData.env);
      });
      var grouped = data.map(function(d){
        return{
          x: new Date(d.YearName, appUtilities.monthIndex(d.MonthName), d.DayOfMonth),
          y: d.MetricValue - 0,
          d: d.DateParts
        }
      });
      //sum and combined the same date data
      var results = appUtilities.sumGroup(grouped,'x', 'y');
      
      
      results.sort(function(a,b){
        if(a.x > b.x) return 1;
        else if(a.x < b.x) return -1;
        else{
          console.log("error, should not include same date");
          return 0;
        }
      })

      // Use the grouped & uniqued data for the chart
      myData.showChart = results.length && results.length > 0;
      $scope.display.date = d3.extent(results, function(d) { return d.x; });
      myData.data = results;
    }

    $scope.chartTitle = config.pathMap[0].name;

    $scope.$watch(function () {
      return $location.path();
    }, function (newPath) {
      var found = $filter('filter')(config.pathMap, {path:newPath}, true);
      if(found.length){
        $scope.display = {
          cursor: []
        };
        $scope.chartTitle = found[0].name;
        loadData(config.src + newPath+'?callback=JSON_CALLBACK');
      }
      else{
        $scope.chartTitle = config.pathMap[0].name;
        loadData(config.src + config.pathMap[0].path +'?callback=JSON_CALLBACK');
      }
    });
    
    $scope.changeEnvFunc = function(newEnv){
      myData.env = newEnv;
      filterData();
    }
  }
]);