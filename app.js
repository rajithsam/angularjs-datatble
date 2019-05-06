var app = angular.module('demoApp', ['datatables'])
       .controller('MainController', MainController)
       .factory('DataService',['$http', '$q', function($http, $q)
            {
                return {
                    execute: function(page, length) 
                    {
                        var defered = $q.defer();
                        $http.get('https://jsonplaceholder.typicode.com/users?_page='+page+'&_limit='+length)
                            .then(function(resp)
                            {
                                defered.resolve(resp.data);
                            });
            
                        return defered.promise;
                    }
                }
            }]);

    function MainController($scope, $compile, DTOptionsBuilder, DTColumnBuilder, DataService, $http, $q) 
    {
        var vm = this;
        vm.dtOptions = DTOptionsBuilder
        // .fromFnPromise(function () 
        // {
        //     var defer = $q.defer();
        //     $http.get('https://jsonplaceholder.typicode.com/users?_page=1&_limit=10').then(function(result) 
        //     {
        //         var data = result.data.data;
        //         defer.resolve(data);
        //     });
        //     return defer.promise;
        // })
        .newOptions()
        .withFnServerData(serverData)
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('searching', false)
        .withOption('paging', true)
        .withPaginationType('full_numbers')
        .withDisplayLength(5)
        .withOption('lengthMenu', [[5, 10, 15, 20, 25,-1],[5,10,15,20,25,"All"]])
        //.withOption('responsive', true)
        .withOption('createdRow', function(row, data, dataIndex) 
        {
            angular.forEach(angular.element(row).contents(), function(elem, key)
            {
                var th = $('#testTable th').eq(elem.cellIndex);
                elem.setAttribute("data-th", th.text());
            });
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        });

        function serverData(sSource, aoData, fnCallback, oSettings) 
        {
            var draw = aoData[0].value;
            var order = aoData[2].value;
            var start = aoData[3].value;
            var length = aoData[4].value;
            var page = Math.ceil(start / length) + 1; 

            DataService.execute(page, length)
                        .then(function(result)
                        {
                            var records = {
                                    'draw': draw,
                                    'recordsTotal': result.length,
                                    'recordsFiltered': result.length,
                                    'data': result  
                                };
                            fnCallback(records);
                        });
        }
        vm.dtColumns = [
            DTColumnBuilder.newColumn('id').withTitle('ID').notSortable(),
            DTColumnBuilder.newColumn('name').withTitle('Name').notSortable(),
            DTColumnBuilder.newColumn('username').withTitle('User Name').notSortable(),
            DTColumnBuilder.newColumn('email').withTitle('Email').notSortable(),
            DTColumnBuilder.newColumn('phone').withTitle('Phone').notSortable(),
            DTColumnBuilder.newColumn('website').withTitle('Website').notSortable()
        ];
       
    }