
describe('chart test', function() {

    var maxYAxis;
   
    beforeEach(function(){
        module('myChart');
        inject(function($injector){
            maxYAxis = $injector.get('MaxYAxis');
        });
    });

    describe('factory test', function(){
        it('should return Y MaxValue which is properly added',function(){
            expect(maxYAxis(3000)).toEqual(3300);
            expect(maxYAxis(0)).toEqual(1);
        });
    });
});

describe('chart utilities test', function() {

    var chartUtilities, d3;
   
    beforeEach(function(){
        module('myApp');
        module('myChart');
        inject(function($injector){
            d3 = $injector.get('d3');
            chartUtilities = $injector.get('chartUtilities');
        });
    });

    describe('pie factory test', function(){
        var svg;
        beforeEach(function(){
            //svg = d3.select(angular.element('<svg></svg>'));
            svg = d3.select(document.createElement('svg'));
        });

        it('should insert pie element into svg',function(){
            var arcs = svg.selectAll("g");
            expect(arcs[0].length == 0).toBe(true);
            chartUtilities.CreatePieChart(svg, [{x:44, y:'EIT100'}, {x:48, y:'EIT300'}]);
            arcs = svg.selectAll("g");
            expect(arcs[0].length > 0).toBe(true);
        });
    });
});

