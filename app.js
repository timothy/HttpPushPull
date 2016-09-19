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

app.service('Keeper', function ($http, $q) {

    //to simplify the solution config -- this is a quick mimic of getting config URLs from the server


    var Env = 'dev';//dev, test, prod
    var configData = {};
    configData.dev = {};
    configData.test = {};
    configData.prod = {};

    /**
     * this mimics going out to the web to retrieve config URLs
     * @param env - the environment for the URLs
     * @param path - a string that contains the config path of the data URL. I.e my.path.to.firstURL
     * @returns {Promise} the config Object || when a path is present a specific URL
     */
    function getConfig(env, path) {
        Env = env ? env : Env;

        configData.dev.firstURL = 'http://getbible.net/json?passage=Jn3:13';
        configData.test.firstURL = 'http://getbible.net/json?passage=Jn3:14';
        configData.prod.firstURL = 'http://getbible.net/json?passage=Jn3:15';

        configData.dev.secondURL = 'http://getbible.net/json?passage=Jn3:16';
        configData.test.secondURL = 'http://getbible.net/json?passage=Jn3:17';
        configData.prod.secondURL = 'http://getbible.net/json?passage=Jn3:18';

        //test long path to URL
        configData.prod.long = {}; configData.prod.long.path = {};
        configData.prod.long.path.firstURL = 'http://getbible.net/json?passage=Jn3:16';

        if (path) {//return URL if path is provided
            var sub = path.includes(".");
            path = sub ? path.split(".") : path;

            if (sub) {
                var URL = "";
                URL = config[Env][path[0]];
                for (var i = 0; i < path.length; i++) {
                    URL = URL[path[i]];
                }
                return $q.when(URL);
            } else {
                return $q.when(config[Env][path]);
            }
        }

        return $q.when(configData);
    }


    ////////////////////////////Keeper Service///////////////////////////////////////////

    var httpKeeper = {};
    var service = {};
    service.myHttp = getData;

    return service;

    function pushHttp(key, path) {
        //httpKeeper
    }

    /**
     * initial pull from service or controller
     * @param key - the identifier for your data call
     * @param path - a string that contains the config path of the data URL
     * @param cb - the call back that will be called each time data arrives
     */
    function getData(key, path, cb) {

        httpKeeper[key] = {};
        httpKeeper[key].path = path;
        httpKeeper[key].cb = cb;

        getConfig(false, path).then(function (URL) {
            $http.get(URL).then(function (data) {
                data.data = JSON.parse(data.data.substring(1, data.data.length - 2));// this is only for the test URL... Any URL that gives proper json data does not need this...

                cb(data);
            });
        });
    }
});

app.controller('myCtrl', function ($scope, serviceOne) {
    $scope.myHeader = "Hello World!";

    serviceOne.getData("http://getbible.net/json?passage=Jn3:16", "controller").then(function (data) {
        data.data = JSON.parse(data.data.substring(1, data.data.length - 2));
        $scope.serviceNum = data.wheMadeReq;
        $scope.response = data.data;


        console.log(data.data);
    })
});

//"http://getbible.net/json?passage=Jn3:16"