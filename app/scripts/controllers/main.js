'use strict';

/**
 * @ngdoc function
 * @name firebaseApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the firebaseApp
 */
angular.module('firebaseApp')
  .controller('MainCtrl', function ($scope, $location, $firebase,localStorageService, config) {

    var ref = new Firebase(config.firebaseURL);
    var sync = $firebase(ref);
    $scope.username = localStorageService.get('userName');

    $scope.submitUsername = function () {
      localStorageService.set('userName', $scope.email)
      $scope.username = $scope.email;
    };

    $scope.create = function () {
      sync.$push({
        createdBy: $scope.username,
        createdAt: Date.now(),
        status: 'created',
        peers: null,
        signaling: null
      }).then(function(newChildRef) {
        console.log('Record added: ', newChildRef.key());
        $location.path('/room/' + newChildRef.key() );
      });
    };

    $scope.toList = function () {
      $location.path('/list');
    };
  });
