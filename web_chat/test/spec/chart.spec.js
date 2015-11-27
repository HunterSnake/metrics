
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