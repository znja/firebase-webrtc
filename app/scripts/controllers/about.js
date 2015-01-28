'use strict';

/**
 * @ngdoc function
 * @name firebaseApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the firebaseApp
 */
angular.module('firebaseApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
