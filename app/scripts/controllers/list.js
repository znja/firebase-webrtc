'use strict';

/**
 * @ngdoc function
 * @name firebaseApp.controller:ListCtrl
 * @description
 * # ListCtrl
 * Controller of the firebaseApp
 */
angular.module('firebaseApp')
  .controller('ListCtrl', function ($scope, $location, $firebase, config) {

    var ref = new Firebase(config.firebaseURL);
    var list = $firebase(ref);
    list.$asArray().$loaded().then(function (data) {
      $scope.list = data;
    });

    $scope.join = function (id) {
      $location.path( '/room/' + id );
    };

  });
