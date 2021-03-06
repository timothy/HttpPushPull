/**
 * Author: Timothy
 * Big time NOTE!!! Most browsers security will stop this from working...
 * I am only making this as a proof of concept. I had to disable my browser security
 * for this to work on my machine... This is do to cross site scripting... i.e. asking for
 * json data from a different site other than the origin URL.
 *
 * The idea behind this: To be used in a mobile app: When the mobile apps API URL changes
 * or when a developer switches from dev, prod, or test URLs the new data will be displayed
 * without any need to refresh the app, clear the memory/cache or reinstall the app with new API URLs.
 * @type {angular.Module}
 */


var app = angular.module('myApp', []);

app.service('Keeper', function ($http, $q) {

    //to simplify the solution config -- this is a quick mimic of getting config URLs from the server

    var Env = 'prod';//dev, test, prod
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
        configData.prod.long = {};
        configData.prod.long.path = {};
        configData.prod.long.path.firstURL = 'http://getbible.net/json?passage=Jn3:16';

        if (path) {//return URL if path is provided
            console.log(path);
            var sub = path.includes(".");
            path = sub ? path.split(".") : path;

            console.log(path);
            if (sub) {
                var URL = configData[Env][path[0]];
                for (var i = 1; i < path.length; i++) {
                    URL = URL[path[i]];
                }
                return $q.when(URL);
            } else {
                return $q.when(configData[Env][path]);
            }
        }

        return $q.when(configData);
    }


    ////////////////////////////Keeper Service///////////////////////////////////////////

    var httpKeeper = {};
    var service = {};
    service.myHttp = getData;
    service.pushHttp = pushHttp;
    service.unsubscribe = unsubscribe;

    return service;

    /**
     * A service can update the data for any call back based on the key.
     * @param env the environment for the config the URLs
     * @param key the identifier for the data call
     * @param path a string that contains the config path for the data URL
     */
    function pushHttp(env, key, path) {
        getConfigURLData(env, path).then(function (data) {
            httpKeeper[key].cb(data);
        });
    }

    function unsubscribe(key) {
        if (httpKeeper.hasOwnProperty(key)) {
            delete httpKeeper[key];
        }
    }

    /**
     * Initial pull from service or controller
     * @param key - the identifier for the data call
     * @param path - a string that contains the config path for the data URL
     * @param cb - the call back that will be called each time data arrives
     */
    function getData(key, path, cb) {

        httpKeeper[key] = {};
        httpKeeper[key].path = path;
        httpKeeper[key].cb = cb;

        getConfigURLData(false, path).then(function (data) {
            cb(data);

        });
    }

    /**
     * This will retrieve the json data for the REST URL in the config file that the path points to.
     * @param env the environment for the config the URLs
     * @param path a string that contains the config path for the data URL
     * @returns {Object} json data for the REST URL in the config file that the path points to
     */
    function getConfigURLData(env, path) {
        return getConfig(env, path).then(function (URL) {
            return $http.get(URL).then(function (data) {
                data.data = JSON.parse(data.data.substring(1, data.data.length - 2));// this is only for the test URL... Any URL that gives proper json data does not need this...

                return data;
            });
        });
    }
});

///////////////////////////////////THEORY TEST BELOW////////////////////////////////////////////


app.service('changer', function (Keeper, $timeout) {

    var service = {};
    service.mimicChange = mimicChange;

    return service;

    function mimicChange() {
        $timeout(function () {
            Keeper.pushHttp('dev', "testOne", "firstURL");//should get Jn3:13
            console.log('update with timeout fired')
        }, 4000);
    }

});

app.controller('myCtrl', function ($scope, Keeper, changer) {
    $scope.myHeader = "Hello World!";

    changer.mimicChange();

    $scope.$on("$destroy", function () {
        Keeper.unsubscribe("testOne");
    });

    //should get Jn3:16 and then when changer.mimicChange is fired should auto update with new data i.e. Jn3:13
    //changer.mimicChange should be able to change the below even if fired from an outside source as long as the controller is active
    Keeper.myHttp("testOne", "long.path.firstURL", function (data) {
        $scope.response = data.data;
        console.log(data.data);
    })
});

//"http://getbible.net/json?passage=Jn3:16"