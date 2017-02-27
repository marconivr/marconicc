var myapp = angular.module('sortableApp', ['ui.sortable']);


myapp.controller('sortableController', function ($scope,$http) {

    $scope.studentsData = null;

    $http.get('/get-classi-composte').
    then(function(response) {
        $scope.studentsData = response.data;
    });






    $scope.sortableOptions = {
        placeholder: "app",
        connectWith: ".apps-container"
    };


    // $scope.logModels = function () {
    //     $scope.sortingLog = [];
    //     for (var i = 0; i < $scope.rawScreens.length; i++) {
    //         var logEntry = $scope.rawScreens[i].map(function (x) {
    //             return x.title;
    //         }).join(', ');
    //         logEntry = 'container ' + (i+1) + ': ' + logEntry;
    //         $scope.sortingLog.push(logEntry);
    //     }
    // };
});




