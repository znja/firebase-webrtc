'use strict';

/**
 * @ngdoc function
 * @name firebaseApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the firebaseApp
 */
angular.module('firebaseApp')
  .controller('MainCtrl', function ($scope, $location, $firebase, config) {

    var ref = new Firebase(config.firebaseURL);
    var list = $firebase(ref);


    function marshalData(data) {
      angular.forEach(data, function (session) {
        session.peerCount = _.size(session.peers);
        session.createdAt = new Date(session.createdAt).toUTCString();
      });
      return data;
    }

    $scope.create = function () {
      list.$push({
        createdAt: Date.now()
      }).then(function(newChildRef) {
        console.log('Record added: ', newChildRef.key());
        $location.path('/room/' + newChildRef.key() );
      });
    };

    list.$asArray().$loaded().then(function (data) {
      $scope.loaded = true;
      data.$watch(function() {
        marshalData($scope.list);
      })
      $scope.list = marshalData(data);

    });

    $scope.join = function (id) {
      $location.path( '/room/' + id );
    };

    $scope.remove = function (id) {
      list.$remove(id);
    }

    $scope.toList = function () {
      $location.path('/list');
    };
  });
