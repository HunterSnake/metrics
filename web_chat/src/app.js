/* src/app.js */
// Application Module 
angular.module('myApp', ['myChart'])
.constant('config', {
  src: 'http://localhost:8008/collections/MetricAggregates{1}View/AggregateId{2}?callback=JSON_CALLBACK',
  //src: 'http://metrics-datasync-service.15.126.133.55.xip.io/collections/MetricAggregates{1}View/AggregateId{2}?callback=JSON_CALLBACK',
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
    aggreId:'',
    filter: function(dateparts, env){
      var sf = $filter('uppercase');
      var aggId = this.aggreId;
      if(!env){
        env = this.env;
      }
      // get data
      var dataset = this.originalData.filter(function(e){
        return e.DateParts == dateparts && (env === 'all' || sf(env) === sf(e.Instance));
      }).map(function(d){
        var groupValue = '';

        if(env === 'all'){
          groupValue = d.Instance;
        }
        else{
          if (aggId == 6) {
            if (d.SubGroupingValue.indexOf("ME_I_") != -1)
                groupValue = d.GroupingValue.trim() + " Success_" + d.SubGroupingValue.substring(5, 9);
            else if (d.SubGroupingValue.indexOf("ME_E_") != -1)
                groupValue = d.GroupingValue.trim() + " Failure_" + d.SubGroupingValue.substring(5, 9);
          }
          else if (aggId == 8) {
            if (d.SubGroupingValue == "Individual=No; Distribution=No; Escalation=No; KeywordMatch=No;")
                groupValue = d.GroupingValue.trim() + " No Match";
            else if (d.SubGroupingValue == "Individual=No; Distribution=No; Escalation=No; KeywordMatch=Yes;")
                groupValue = d.GroupingValue.trim() + " No Action";
            else if (d.SubGroupingValue == "Individual=No; Distribution=No; Escalation=Yes; KeywordMatch=No;")
                groupValue = d.GroupingValue.trim() + " Direct Esc";
            else if (d.SubGroupingValue == "Individual=No; Distribution=Yes; Escalation=No; KeywordMatch=No;")
                groupValue = d.GroupingValue.trim() + " Direct Dist";
            else if (d.SubGroupingValue == "Individual=Yes; Distribution=No; Escalation=No; KeywordMatch=No;")
                groupValue = d.GroupingValue.trim() + " Direct Indiv";
            else if (d.SubGroupingValue == "Individual=No; Distribution=Yes; Escalation=Yes; KeywordMatch=No;")
                groupValue = d.GroupingValue.trim() + " Esc & Dist";
            else if (d.SubGroupingValue == "Individual=Yes; Distribution=No; Escalation=Yes; KeywordMatch=No;")
                groupValue = d.GroupingValue.trim() + " Esc & Indiv";
            else if (d.SubGroupingValue == "Individual=Yes; Distribution=Yes; Escalation=No; KeywordMatch=No;")
                groupValue = d.GroupingValue.trim() + " Dist & Indiv";
            else if (d.SubGroupingValue == "Individual=Yes; Distribution=Yes; Escalation=Yes; KeywordMatch=No;")
                groupValue = d.GroupingValue.trim() + " Esc, Dist & Indiv";
            else if (d.SubGroupingValue == "Individual=No; Distribution=No; Escalation=Yes; KeywordMatch=Yes;")
                groupValue = d.GroupingValue.trim() + " Match Esc";
            else if (d.SubGroupingValue == "Individual=No; Distribution=Yes; Escalation=No; KeywordMatch=Yes;")
                groupValue = d.GroupingValue.trim() + " Match Dist";
            else if (d.SubGroupingValue == "Individual=No; Distribution=Yes; Escalation=Yes; KeywordMatch=Yes;")
                groupValue = d.GroupingValue.trim() + " Match Esc & Dist";
            else if (d.SubGroupingValue == "Individual=Yes; Distribution=No; Escalation=Yes; KeywordMatch=Yes;")
                groupValue = d.GroupingValue.trim() + " Match Esc & Indiv";
            else if (d.SubGroupingValue == "Individual=Yes; Distribution=Yes; Escalation=No; KeywordMatch=Yes;")
                groupValue = d.GroupingValue.trim() + " Match Dist & Indiv";
            else if (d.SubGroupingValue == "Individual=Yes; Distribution=Yes; Escalation=Yes; KeywordMatch=Yes;")
                groupValue = d.GroupingValue.trim() + " Match Esc, Dist & Indiv";
            else if (d.SubGroupingValue == "Individual=Yes; Distribution=No; Escalation=No; KeywordMatch=Yes;")
                groupValue = d.GroupingValue.trim() + " Match Indiv";
          }
          else{
            groupValue = d.GroupingValue.trim() + d.SubGroupingValue.trim();
          }
        }

        return{
          x: +d.MetricValue,
          y: groupValue,
          d: d.DateParts,
          t: aggId == 6 && env !== 'all' ? d.GroupingValue.trim() + d.SubGroupingValue.trim() : ''
        }
      });

      var results = appUtilities.sumGroup(dataset, 'y', 'x');
      return results;
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

      
      
      $scope.toolTipTitle = $filter('date')(date,"dd-MMM-yyyy");
      
      if(env == 'all'){
        $('#slider').stop().animate({left: 0},1000);
        $scope.toolTipSubTitle = env;
        $scope.toolTipNum = hitPoints;
        $scope.forward1 = false;
        $scope.forward2 = false;

      }else if(env == 'others'){
        $('#slider').stop().animate({left: -840},1000);
        $scope.toolTipSubTitle3 = env;
        $scope.toolTipNum3 = hitPoints;
        $scope.forward2 = true;
      }
      else{
        $('#slider').stop().animate({left: -420},1000);
        $scope.toolTipSubTitle2 = env;
        $scope.toolTipNum2 = hitPoints;
        $scope.forward1 = true;
        $scope.forward2 = false;
      }
      $scope.$apply();
    }

    $scope.forward1 = false;
    $scope.forward2 = false;

    $scope.toolTipBack = function(step){
      $('#slider').stop().animate({left: (step-1)*-420},1000);
    }

    $scope.pieColorSet = config.pieColorSet;

    $scope.notReady = false;
    $scope.building = function(){
      $scope.notReady = true;
    }

    $scope.showing = function(){
      $scope.notReady = false;
    }

    $scope.hideToolTip = function(){
      chartUtilities.hideToolTip();
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
    $scope.viewMap = config.viewMap;

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
        myData.aggreId = found[0].path.substr(1);
        loadData(config.loadDataSrc($scope.chartView, found[0].path));
      }
      else{
        $scope.chartTitle = config.pathMap[0].name;
        myData.aggreId = config.pathMap[0].path.substr(1);
        loadData(config.loadDataSrc($scope.chartView, config.pathMap[0].path));
      }
    });
   
    $scope.changeEnvFunc = function(newEnv){
      myData.env = newEnv;
      filterData();
    };
  }
]);