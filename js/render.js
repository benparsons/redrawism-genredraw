function RenderCtrl($scope, $http) {

    function init() {
        //debugger;
        $scope.raw = [] // Initialize with an empty array
        $scope.parsed = [] // Initialize with an empty array
        $scope.index = 0;
        $scope.frames = [];

		angular.forEach(indexes, function (value, key) {
            $http({
                method: "GET",
                url: "/get/frame?index=" + value + "&filename=" + filename
            }).success(function (data) {
                var newFrame = data[0];
                //newFrame.url = "/render/renderSingle.html?width=169&height=225&multiplier=0.5&background=000000&poly=" + encodeURIComponent(JSON.stringify(newFrame.polyArray));
                newFrame.url = "/render/renderAnimate.html?width=" + newFrame.width + 
                    "&height=" + newFrame.height + 
                    "&multiplier=1&background=000000&poly=" + encodeURIComponent(JSON.stringify(newFrame.polyArray));

                $scope.frames.push(newFrame);

            });
		})
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
