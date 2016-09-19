var app = angular.module('myApp', []);

app.service('serviceOne', function ($http) {

    var service = {};
    service.getData = getData;

    return service;

    function getData(URL, whoMadeReq) {

        return $http.get(URL).then(function (data) {
            data.sevice = whoMadeReq;
            return data;
        });
    }
});

app.controller('myCtrl', function ($scope, serviceOne) {
    $scope.myHeader = "Hello World!";

    serviceOne.getData("http://getbible.net/json?passage=Jn3:16", "controller").then(function (data) {
        data.data = JSON.parse(data.data.substring(1, data.data.length-2));
        $scope.serviceNum = data.wheMadeReq;
        $scope.response = data.data;


        console.log(data.data);
    })
});

//"http://getbible.net/json?passage=Jn3:16"