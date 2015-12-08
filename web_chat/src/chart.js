/* src/chart.js */
// Chart Module 
angular.module('myChart', [])

// D3 Factory
.factory('d3', function() {

  /* We could declare locals or other D3.js
     specific configurations here. */
  return d3;
})

.factory('MaxYAxis',  function(){
  return function(maxYAxis) {
    var reMaxVal = Math.ceil(maxYAxis / 10);
    if(reMaxVal < 1) reMaxVal = 1;
    return reMaxVal + maxYAxis;
  };
})

.factory('hideToolTip', ['d3', function(d3){
  return function(){
    d3.selectAll('.barHover').classed('barHover', false);
    d3.select("#tooltip").classed("hidden", true);
  };
}])

.factory('chartUtilities', ['d3', 'config', 'myData', function(d3, config, myData){
  var insertLinebreaks = function(d) {
      var el = d3.select(this);
      var spans = el.selectAll('tspan')[0];
      for (var i = 0; i < spans.length; i++) {
          var tspan = spans[i];
          if (i > 0)
              d3.select(tspan).attr('x', 0).attr('dy', '12');
          else
              d3.select(tspan).attr('x', 0).attr('dy', '-3');
      }
  };

  var canClick = false;

  var appendSlices = function(svg, data, callByClick){
    var pie = d3.layout.pie()
            .value(function(d) { return d.x; });
    var w = 220, h = 180,
      radius = Math.min(w, h) / 2;
    var arc = d3.svg.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(0);

    var outerArc = d3.svg.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    var color = d3.scale.category20c();

    if(callByClick){
      var oldSlices = svg.select(".slices").selectAll("path.slice");
      oldSlices.transition().duration(1000).style("opacity","0").attr("pointer-events","none");
      var oldLables = svg.select(".labels").selectAll("text");
      oldLables.transition().duration(1000).style("opacity","0").attr("pointer-events","none");
      var oldLines = svg.select(".lines").selectAll("polyline");
      oldLines.transition().duration(1000).style("opacity","0").attr("pointer-events","none");

      setTimeout(function(){
            oldSlices.data([]).exit().remove();
            oldLables.data([]).exit().remove();
            oldLines.data([]).exit().remove();

            var results = myData.filter(clickBar.d, clickChip.data.y);
            appendSlices(svg, results, false);
          }
        ,1000);
      return;
    }
    
    /* ------- PIE SLICES -------*/
    var keyFunc = function(d){ 
      return d.data.y; 
    };

    var slice = svg.select(".slices").selectAll("path.slice")
      .data(pie(data), keyFunc);

    slice.enter()
      .insert("path")
      .style("fill", function(d, i) {
            return color(i);
          })
      .attr("class", "slice");

    slice   
      .transition().duration(1000)
      .attrTween("d", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      })

    slice.exit()
      .remove();

    /* ------- move the positions if two chips is too near --------------*/

    var moveFlag = false;
    var piedatas = pie(data);
    if(piedatas.length > 2){
      moveFlag = true;
      var i = 0;
      for(;i < piedatas.length;i ++){
        piedatas[i].index = i;
      }
      piedatas.sort(function(a, b){
        return a.startAngle - b.startAngle;
      });
      var step = 6.283 / piedatas.length;
      for(i = 0; i < piedatas.length; i++){
        piedatas[i].startAngle = i * step;
        piedatas[i].endAngle = (i+1) * step;
      }
      piedatas.sort(function(a, b){
        return a.index - b.index;
      });
    }

    /* ------- TEXT LABELS -------*/
    var text = svg.select(".labels").selectAll("text")
      .data(pie(data), keyFunc);

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .html(function(d) {
        return "<tspan>" + d.data.y + "</tspan><tspan>" + d.data.x + "</tspan>";
      });
      
    function midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    i = 0;
    var j = 0;

    text.transition().duration(1000)
      .attrTween("transform", function(d) {
        var dcopy = $.extend(true,{},d);
        if(moveFlag){
          dcopy.startAngle = piedatas[i].startAngle;
          dcopy.endAngle = piedatas[i].endAngle;
          i++;
        }

        this._current = this._current || dcopy;
        var interpolate = d3.interpolate(this._current, dcopy);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate("+ pos +")";
        };
      })
      .styleTween("text-anchor", function(d){
        var dcopy = $.extend(true,{},d);
        if(moveFlag){
          dcopy.startAngle = piedatas[j].startAngle;
          dcopy.endAngle = piedatas[j].endAngle;
          j++;
        }

        this._current = this._current || dcopy;
        var interpolate = d3.interpolate(this._current, dcopy);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start":"end";
        };
      });

    text.exit()
      .remove();

    svg.selectAll('g.labels text').each(insertLinebreaks);

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), keyFunc);
    
    polyline.enter()
      .append("polyline");


    var k = 0;
    polyline.transition().duration(1000)
      .attrTween("points", function(d){
        var dcopy = $.extend(true,{},d);
        if(moveFlag){
          dcopy.startAngle = piedatas[k].startAngle;
          dcopy.endAngle = piedatas[k].endAngle;
          k++;
        }

        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        var interpolate2 = d3.interpolate(this._current, dcopy);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var dm2 = interpolate2(t);
          var pos = outerArc.centroid(dm2);
          pos[0] = radius * 0.95 * (midAngle(dm2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), outerArc.centroid(dm2), pos];
        };      
      });
    
    polyline.exit()
      .remove();

    if(canClick){
      var clickFunc = function(d){
        clickChip = d;
        myScope.toolTipFunc(clickBar.x, d.data.x, d.data.y);
        appendSlices(svg, [], true);
      };

      slice.attr("cursor", "pointer")
        .on("click", clickFunc);
      text.attr("cursor", "pointer")
        .on("click", clickFunc);
      polyline.attr("cursor", "pointer")
        .on("click", clickFunc);
      canClick = false;
    }
  };

  var myScope = null;
  var clickBar = null;
  var clickChip = null;

  return {
    CreatePieChart2: function (psvg, data){
        var w = 150;
        var h = 150;

        psvg.attr("width", w)
          .attr("height", h);

        psvg.selectAll('g.arc').data([])
          .exit()
          .remove();

        //draw pie chart in tooltip
        

        var outerRadius = w / 2;
        var innerRadius = 0;
        var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
        
        var pie = d3.layout.pie()
            .value(function(d) { return d.x; });

        var color = d3.scale.ordinal().range(config.pieColorSet);

        //Set up groups
        var arcs = psvg.selectAll("g.arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")
                .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");
        
        //Draw arc paths
        arcs.append("path")
            .attr("fill", function(d, i) {
              return color(i);
            })
            .attr("d", arc);
        var sumHits = d3.sum(data,function(d){ return +d.x; });
        
        //Labels
        arcs.append("text")
            .attr("transform", function(d) {
              return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
              var percent = Number(d.data.x)/sumHits * 100;
              return percent.toFixed(1) + "%";
            });
      },

    CreatePieChart: function(psvg, data, clickflag, scope, bar){
      myScope = scope;
      clickBar = bar;
      var svg;
      if(psvg.selectAll("g")[0].length == 0){
        svg = psvg.attr("width", 400)
            .attr("height", 200)
            .append("g");

        svg.append("g")
          .attr("class", "slices");
        svg.append("g")
          .attr("class", "labels");
        svg.append("g")
          .attr("class", "lines");

        svg.attr("transform", "translate(" + 200 + "," + 100 + ")");
      }
      else{
        svg = psvg.select('g');
      }
      canClick = clickflag;
      appendSlices(svg, data, false);
    }
  };
}])

.filter('gte_date', function(){
  return function(input, raw_date){
    var date = new Date(raw_date);
    return isNaN(date.getTime()) ? input : input.filter(function(d){
      return d.x >= date;
    });
  };
})

.filter('lte_date', function(){
  return function(input, raw_date){
    var date = new Date(raw_date);
    return isNaN(date.getTime()) ? input : input.filter(function(d){
      return d.x <= date;
    });
  };
})


// Brush Chart directive
.directive('myBrushChart', ["d3", "myData",
  function(d3, myData){

    function draw(svg, width, height, data, dispatch) {

      if (data && !data.length) {
        return;
      }

      svg
        .attr('width', width)
        .attr('height', height);

      // Define a margin
      var margin = 10;

      // Define x scale
      var xScale = d3.time.scale()
        .domain(d3.extent(data, function(d) { return d.x; }))
        .range([margin, width-margin]);

      // Define y-scale
      var yScale = d3.time.scale()
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([height-margin, margin]);


      var easing = d3.ease('cubic');
      var ease_type = 'cubic';
      var max = d3.max(data, function(d){ return d.y; });
      var duration = 2500;

      // Draw a line
      var line0 = d3.svg.line()
        .x(function(d) { return xScale(d.x); })
        .y(function(d) { return yScale(0); })
        .interpolate('cardinal');

      var line1 = d3.svg.line()
        .x(function(d) { return xScale(d.x); })
        .y(function(d) { return yScale(d.y); })
        .interpolate('cardinal');

      svg.select(".data-line")
        .datum(data)
        .attr("d", line0)
        .transition()
        .ease(ease_type)
        .duration(duration)
        .attr("d", line1);

      // Draw a area

      var area0 = d3.svg.area()
        .x(function(d) { return xScale(d.x); })
        .y0(yScale(0))
        .y1(function(d) { return yScale(0); })
        .interpolate('cardinal');

      var area1 = d3.svg.area()
        .x(function(d) { return xScale(d.x); })
        .y0(yScale(0))
        .y1(function(d) { return yScale(d.y); })
        .interpolate('cardinal');

      svg.select(".data-area")
        .datum(data)
        .attr("d", area0)
        .transition()
        .ease(ease_type)
        .duration(duration)
        .attr("d", area1);

      var brush = d3.svg.brush()
        .x(xScale)
        .on('brushstart', function(){
          dispatch.brushstart(brush);
        })
        .on('brush', function(){
          dispatch.brush(brush);
        })
        .on('brushend', function(){
          dispatch.brushend(brush);
        });

      svg.select('.brush')
        .call(brush)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", height-margin);
    }

    return {
      restrict: 'E',
      scope: {
        data: '=',
        brush: '='
      },
      compile: function( element, attrs, transclude ) {

        //console.log(element[0].parentElement.offsetWidth);

        // Create a SVG root element
        var svg = d3.select(element[0]).append('svg');

        /* Create container */
        var visCont = svg.append('g').attr('class', 'vis');
        var dataCont = visCont.append('g').attr('class', 'data');
        var brushCont = visCont.append('g').attr('class', 'brush');;

        dataCont.append('path').attr('class', 'data-line');
        dataCont.append('path').attr('class', 'data-area');

        // Initialize the brush events
        var dispatch = d3.dispatch(
          "brushstart", "brush", "brushend"
        );

        // Define the dimensions for the chart
        var width = element[0].parentElement.offsetWidth - 30, height = 50;

        // Return the link function
        return function(scope, element, attrs) {
          dispatch.on('brush', function(brush){ 
            scope.$apply(function(){
              scope.brush = brush.extent();
            });
          });

          // Watch the data attribute of the scope
          scope.$watch('data', function(newVal, oldVal, scope) {
            
            // Update the chart
            if (scope.data) {
              draw(svg, width, height, myData.data, dispatch);
            }
          }, true);
        };
      }
    };
}])


// Bar Chart directive
.directive('myBarChart', ["d3", "$filter", "MaxYAxis", "config", "hideToolTip", "appUtilities", "myData", "chartUtilities", 
  function(d3, $filter, MaxYAxis, config, hideToolTip, appUtilities, myData, chartUtilities){

    function draw(svg, width, height, data, scope) {

      if (!data || !data.length) {
        return;
      }

      svg
        .attr('width', width)
        .attr('height', height);

      // Define a margin
      var margin = 30;
      var labelPadding = 50;

      var dataExtent = d3.extent(data, function(d) { return d.x; });
      var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
      dayNumber = Math.round(Math.abs((dataExtent[1].getTime() - dataExtent[0].getTime())/(oneDay)));

      var barWidth = 1;
      if(dayNumber > 0){
        barWidth = Math.floor((width-2*margin-labelPadding)/(1.4*dayNumber));
      }
      //console.log("width="+width+", dayNumber=" +dayNumber+", barWidth=" + barWidth );

      // Define x scale
      var xScale = d3.time.scale()
        .domain(dataExtent)
        .range([margin + labelPadding + barWidth/2 + 2, width-margin]);

      // Define x-axis
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(d3.time.format('%b %d'));

      // Define x-grid
      var xGrid = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickSize(height - 2*margin, 0, 0)
        .tickFormat("");

      var maxYAxis = d3.max(data, function(d) { return d.y; });
      maxYAxis = MaxYAxis(maxYAxis);

      // Define y-scale
      var yScale = d3.time.scale()
        .domain([0, maxYAxis])
        .range([height-margin, margin]);

      // Define y-axis
      var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickFormat(d3.format('f'));

      // Define y-grid
      var yGrid = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(-width + 2*margin, 0, 0)
        .tickFormat("");

      // Draw the x-axis
      svg.select('.x-axis')
        .attr("transform", "translate(0, " + (height-margin) + ")")
        .call(xAxis);
      
      //Draw the y-axis
      svg.select('.y-axis')
        .attr("transform", "translate(" + (margin + labelPadding) + ")")
        .call(yAxis);

      // Draw the x-grid
      svg.select('.x-grid')
        .attr("transform", "translate(0, " + margin+ ")")
        .call(xGrid);
      
      // Draw the y-grid
      svg.select('.y-grid')
        .attr("transform", "translate(" + (margin + labelPadding) + ")")
        .call(yGrid);

      /* ---- Draw bars ---- */
      hideToolTip();

      svg.select('.data')
        .selectAll('rect').data(data)
        .enter()
        .append('rect')
        .attr('class', 'data-bar')
        .on('click',function(d){
          //Get this bar's x/y values, then augment for the tooltip
          var clickBar = d3.select(this);
          var xPosition = parseFloat(clickBar.attr("x")) + parseFloat(clickBar.attr("width"));
          var tooltipWidth = 420; //parseFloat($("#tooltip").width());
        
          if(xPosition > width - tooltipWidth){
            xPosition = xPosition - tooltipWidth - parseFloat(clickBar.attr("width")) - 3.0;
          }
          else{
            xPosition += 3.0;
          }

          d3.selectAll('.barHover').classed('barHover', false);
          clickBar.classed('barHover', true);

          var yPosition = 0 - (height + 20);
          
          //Update the tooltip position
          d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px");      

          scope.toolTipFunc(d.x, d.y);

          // var sf = $filter('uppercase');

          // // get data
          // var dataset = myData.originalData.filter(function(e){
          //   return e.DateParts == d.d && (myData.env === 'all' || sf(myData.env) === sf(e.Instance));
          // }).map(function(d){
          //   return{
          //     x: +d.MetricValue,
          //     y: myData.env === 'all'? d.Instance : d.GroupingValue + d.SubGroupingValue,
          //     d: d.DateParts
          //   }
          // });

          // var results = appUtilities.sumGroup(dataset, 'y', 'x');

          var results = myData.filter(d.d);

          //get svg and add pei chart
          var psvg = d3.select("#tipsvg");
          chartUtilities.CreatePieChart(psvg, results, myData.env === 'all', scope, d);

          
          //Show the tooltip
          d3.select("#tooltip").classed("hidden", false);
          d3.event.stopPropagation();
        });
      svg.on('click',function(){
        hideToolTip();
      });

      var easing = d3.ease('cubic');
      var ease_type = 'cubic';
      var max = maxYAxis;
      var duration = 2500;

      svg.select('.data')
        .selectAll('rect').data(data)
        .attr('r', 2.5)
        .attr('x', function(d) { return xScale(d.x) - barWidth/2; })
        .attr('y', function(d) { return yScale(0); })
        .attr('width', barWidth)
        .attr('height', 0)
        .transition()
        .duration(function(d, i){ return duration*(d.y/max); })
        .ease('cubic')
        //.delay(function(d,i) { return 100*i; })
        .delay(function(d,i) { return duration*easing((i+1)/data.length); })
        .attr('y', function(d) { return yScale(d.y); })
        .attr('height', function(d) { return yScale(0) - yScale(d.y); });

      svg.select('.data')
        .selectAll('rect').data(data)
        .exit()
        .remove();
    }

    function filter(data, minDate, maxDate) {
      // Create a new array
      var d = data.slice(0);

      if (minDate !== undefined) {
        d = $filter('gte_date')(d, minDate);
      }
      if (maxDate !== undefined) {
        d = $filter('lte_date')(d, maxDate);
      }
      return d;
    }

    return {
      restrict: 'E',
      scope: {
        data: '=',
        cursor: '=',
        startDate: '=',
        endDate: '='
      },
      compile: function( element, attrs, transclude ) {

        // Create a SVG root element
        var svg = d3.select(element[0]).append('svg');

        /* Create container */
        var visCont = svg.append('g').attr('class', 'vis');
        var axisCont = visCont.append('g').attr('class', 'axis');
        var dataCont = visCont.append('g').attr('class', 'data');

        axisCont.append('g').attr('class', 'x-grid grid');
        axisCont.append('g').attr('class', 'y-grid grid');
        
        axisCont.append('g').attr('class', 'x-axis axis');
        axisCont.append('g').attr('class', 'y-axis axis');

        // Define the dimensions for the chart
        var width = element[0].parentElement.offsetWidth - 30, height = 300;

        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -5)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Hit Points");

        // Return the link function
        return function(scope, element, attrs) {
          // Watch the data attribute of the scope
          scope.$watch('[data, startDate, endDate]', function(newVal, oldVal, scope) {
            // Update the chart
            if (scope.data) {
              var data = filter(scope.data, scope.startDate, scope.endDate);
              draw(svg, width, height, data, scope.$parent);
            }
          }, true);
        };
      }
    };
}])