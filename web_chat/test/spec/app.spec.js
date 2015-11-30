describe('appUtilities test ->', function() {

    var appUtilities, config;
   
    beforeEach(function(){
        module('myApp');
        inject(function($injector){
            appUtilities = $injector.get('appUtilities');
        });
    });

    describe('monthIndex test ->', function(){
        it('should return month index number',function(){
            expect(appUtilities.monthIndex('January')).toEqual(0);
            expect(appUtilities.monthIndex('December')).toEqual(11);
            expect(appUtilities.monthIndex('Error Data')).toEqual(-1);
        });
    });

    describe('sumGroup test ->', function(){
        it('should return sumGroup arry',function(){
            var arr1 = [{x:'a',y:1},{x:'b',y:1},{x:'a',y:11},{x:'a',y:22},{x:'b',y:3}];
            var arr2 = appUtilities.sumGroup(arr1, 'x', 'y');
            expect(arr2.length).toEqual(2);
            expect(arr2[0].y).toEqual(34);
            expect(arr2[1].y).toEqual(4);
        });
    });
});

describe('controller test ->', function() {

    var MainCtrl, scope, $rootScope, $location, config, $httpBackend, $resource, myData;
   
    beforeEach(function(){
        module('myApp');

        inject(function($injector){
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            $httpBackend = $injector.get('$httpBackend');

            myData = $injector.get('myData');
            config = $injector.get('config');
            
            scope = $rootScope.$new();
            MainCtrl = $injector.get('$controller')("MainCtrl", {$scope:scope, $location:$location, myData:myData});
        });
    });

    describe('basic logic ->', function(){
        it('should initial config',function(){
            expect(config.pathMap.length > 0).toBe(true);
        });

        it('initial chartTitle should equals config pathMap 0',function(){
            expect(scope.chartTitle).toEqual(config.pathMap[0].name);
        });

        it('Should using building functon change notReady flag',function(){
            scope.building();
            expect(scope.notReady).toEqual(true);
            scope.showing();
            expect(scope.notReady).toEqual(false);
        });

        

        describe('data load -->',function(){
            beforeEach(function(){
                for(var i=0;i<config.pathMap.length;i++){
                    var bp = function(p){
                        $httpBackend
                            .whenJSONP(config.src + p+'?callback=JSON_CALLBACK')
                            .respond(function(method, url, data){
                                var request = new XMLHttpRequest();
                                console.log(p);
                                request.open('GET', '/base/test/files/agg' + p.replace(/\//,'') +'.json', false);
                                request.send(null);

                                return [request.status, request.response, {}];
                            });
                    };
                    bp(config.pathMap[i].path);
                }
            });

            it('should change the scope chartTitle according the path',function(){
                $location.path(config.pathMap[0].path);
                scope.$digest();
                expect(scope.chartTitle).toEqual(config.pathMap[0].name);
                expect(myData.data.length == 0).toEqual(true);
                $httpBackend.flush();
                expect(myData.data.length > 0).toEqual(true);
            });

            it('should filter data by instance name',function(){
                console.log(myData.data.length);
                $location.path('/');
                scope.$digest();
                $httpBackend.flush();
                var a = myData.data.length;
                scope.changeEnvFunc('EIT100');
                expect(myData.data.length < a).toBe(true);
            });
        });


    });
});