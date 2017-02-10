/**
 * Created by mattiacorradi on 10/02/2017.
 */

var app = angular.module('application', ['dragularModule']);


app.controller('BasicModel', ['$scope', '$element', 'dragularService', function TodoCtrl($scope, $element, dragularService) {

    $scope.items1 = [{
        content: '1'
    }, {
        content: '2'
    }, {
        content: 'Item 3'
    }, {
        content: 'Item 4'
    }];

    $scope.items2 = [{
        content: 'Item 5'
    }, {
        content: 'Item 6'
    }, {
        content: 'Item 7'
    }, {
        content: 'Item 8'
    }];

    $scope.items3 = [{
        content: 'Item 5'
    }, {
        content: 'Item 6'
    }, {
        content: 'Item 11'
    }, {
        content: 'Item 11'
    }];



    var containers = $element.children().children();
    dragularService([containers[0],containers[1],containers[2]],{
        containersModel: [$scope.items1, $scope.items2,$scope.items3]
    });
}]);

