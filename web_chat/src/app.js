/* src/app.js */
// Application Module 
angular.module('myApp', ['myChart'])
.constant('config', {
  src: 'http://localhost:8008/collections/MetricAggregates{1}View/AggregateId{2}?callback=JSON_CALLBACK',
  //src: 'http://metrics-datasync-service.15.126.133.55.xip.io/collections/MetricAggregatesDailyView/AggregateId',
  pathMap:[{path:'/1',name:'Total Messages Sent'},{path:'/2',name:'Requests By CompanyCode'},
          {path:'/5',name:'Onboarded People'},{path:'/6',name:'Messages By Receiver Type and Status'},
          {path:'/7',name:'Requests By External System Type'},{path:'/8',name:'Requests By External System Type and Status'},
          {path:'/10',name:'Onboarded Team'}],
  viewMap:[{path:'/d', name:'Daily'},{path:'/w', name:'Weekly'},{path:'/m', name:'Monthly'}, {path:'/q', name:'Quarterly'}],
  pieColorSet:["#2AD2C9","#FF8D6D","#614767"],
  MonthName:['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  loadDataSrc:function(viewName, aggIdpath){
    return this.src.replace("{1}",viewName).replace("{2}",aggIdpath);
  }
})
.factory('myData', ['$filter','appUtilities', function($filter,appUtilities){
  return {
    originalData:[],
    data:[],
    env:'all',
    startDate:'',
    endDate:'',
    filter: function(dateparts, env){
      var sf = $filter('uppercase');
      if(!env){
        env = this.env;
      }
      // get data
      var dataset = this.originalData.filter(function(e){
        return e.DateParts == dateparts && (env === 'all' || sf(env) === sf(e.Instance));
      }).map(function(d){
        return{
          x: +d.MetricValue,
          y: env === 'all'? d.Instance : d.GroupingValue + d.SubGroupingValue,
          d: d.DateParts
        }
      });

      return appUtilities.sumGroup(dataset, 'y', 'x');
    }
  }
}])

.factory('appUtilities',  ['config', function(config){
  return {
    monthIndex: function(monthName) {
        return config.MonthName.indexOf(monthName);
      },
    sumGroup: function(arr, p1, psum){
      if(!angular.isArray(arr) && !arr.length)
      {
        return null;
      }
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
.controller('MainCtrl', ["$scope", "$http", "$filter", "$location", "config", "d3", "appUtilities", "myData", "chartUtilities",
  function ($scope, $http, $filter, $location, config, d3, appUtilities, myData, chartUtilities) {
    $scope.display = {
      cursor: []
    };

    $scope.toolTipFunc = function(date, hitPoints, env){
      if(!env)
      {
        env = myData.env;
      }

      
      $scope.toolTipNum = hitPoints
      if(env == 'all'){
        $('#slider').stop().animate({left: 0},1000);
        $scope.toolTipTitle = $filter('date')(date,"dd-MMM-yyyy");
        $scope.toolTipSubTitle = "";
      }else{
        $scope.toolTipTitle =  env;
        $scope.toolTipSubTitle = $filter('date')(date,"dd-MMM-yyyy");
        $('#slider').stop().animate({left: -415},1000);
      }
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

    function getX(d){
      if($scope.chartView == 'Daily'){
        return new Date(d.YearName, appUtilities.monthIndex(d.MonthName), d.DayOfMonth);
      }
      else if($scope.chartView == 'Weekly'){
        return new Date(d.YearName, appUtilities.monthIndex(d.MonthName), d.LastDayOfWeek);
      }
      else if($scope.chartView == 'Monthly'){
        return new Date(d.YearName, appUtilities.monthIndex(d.MonthName)); 
      }
      else{
        return d.DateParts;
      }
    }

    function filterData()
    {
      var sf = $filter('uppercase');
      var data = myData.originalData.filter(function(e){
          return myData.env =='all' || sf(e.Instance) === sf(myData.env);
      });
      var grouped = data.map(function(d){
        return{
          x: getX(d),
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
    $scope.chartView = config.viewMap[0].name;
    $scope.pathMap = config.pathMap;

    $scope.$watch(function () {
      return $location.path();
    }, function (newPath) {
      var found = [];
      angular.forEach(config.pathMap, function(item){
        if(newPath.indexOf(item.path) >= 0){
          found.push(item);
        }
      });

      angular.forEach(config.viewMap, function(item){
        if(newPath.indexOf(item.path) >= 0){
          $scope.chartView = item.name;
        }
      });
      
      if(found.length){
        $scope.display = {
          cursor: []
        };
        $scope.chartTitle = found[0].name;
        loadData(config.loadDataSrc($scope.chartView, found[0].path));
      }
      else{
        $scope.chartTitle = config.pathMap[0].name;
        loadData(config.loadDataSrc($scope.chartView, config.pathMap[0].path));
      }
    });
   
    $scope.changeEnvFunc = function(newEnv){
      myData.env = newEnv;
      filterData();
    };
  }
]);