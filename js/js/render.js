function RenderCtrl($scope, $http) {

    function init() {
        //debugger;
        $scope.raw = [] // Initialize with an empty array
        $scope.parsed = [] // Initialize with an empty array
        $scope.index = 0;
        $scope.frames = [];

        $http({method: "GET", url: filename + ".txt?" + (new Date).toJSON(), transformResponse: function (data) {
            return data;
        }})
            .success(function (data) {
                $scope.raw = data.split('\n');
                angular.forEach($scope.raw, function (str) {
                    if (str && str.length > 0) {
                        try {
                            $scope.parsed.push(JSON.parse(str));
                        }
                        catch (err) {
                            console.log(str);
                        }


                    }
                });

                $scope.indexes = [];


                angular.forEach(indexes, function (value, key) {
                    var newFrame = $scope.parsed[value];
                    newFrame.url = "http://localhost:8080/render/renderSingle.html?width=169&height=225&multiplier=0.5&background=000000&poly=" + encodeURIComponent(JSON.stringify(newFrame.polyArray));

                    $scope.frames.push(newFrame);
                });

                console.log($scope.parsed.length);
                // data should be text string here (only if the server response is text/plain)
            });
    }

    init();

}

var myapp = angular.module('myapp', []);

myapp.controller('RenderCtrl', RenderCtrl);

myapp.filter('encodeUri', function ($window) {
    return $window.encodeURIComponent;
});

angular.module('myAppWithSceDisabledmyApp', []).config(function($sceProvider) {
// Completely disable SCE.  For demonstration purposes only!
// Do not use in new projects.
    $sceProvider.enabled(false);
});
