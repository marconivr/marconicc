/**
 * Created by mattiacorradi on 10/02/2017.
 */

var app = angular.module('application', ['dragularModule']);


app.controller('BasicModel', ['$scope', '$element', 'dragularService', function TodoCtrl($scope, $element, dragularService) {

    $scope.items1 = [{
        content: 'Move me, but you can only drop me in one of these containers.'
    }, {
        content: 'If you try to drop me somewhere other than these containers, I\'ll just come back.'
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



    var containers = $element.children().children();
    dragularService([containers[0],containers[1]],{
        containersModel: [$scope.items1, $scope.items2]
    });
}]);

