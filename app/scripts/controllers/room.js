'use strict';

/**
 * @ngdoc function
 * @name firebaseApp.controller:RoomCtrl
 * @description
 * # RoomCtrl
 * Controller of the firebaseApp
 */
angular.module('firebaseApp')
  .controller('RoomCtrl', function ($scope, $rootScope,$window, $routeParams, $sce, $firebase, config, webrtcFactory, camaraService , randomUsernameService) {

    var roomId = $routeParams.id;
    var username = randomUsernameService.get();

    var ref = new Firebase(config.firebaseURL + '/room' + roomId);
    var sRef = ref.child('signaling');

    var parent = $firebase(ref); //Reference to parent
    var mediaStream; //save Local media stream object
    var streamURL; //save locar media stream url (needed for chrome)

    $scope.messages = [];
    $scope.messageToSend = '';

    $scope.remoteStreams = [];
    // Wait till object is loaded from Firebase to bind data
    parent.$asObject().$loaded().then(function (data) {
      $scope.session = data;
    });

    $scope.sendMessage = function() {
      $scope.messages.push(username + ': ' + $scope.messageToSend);
      webrtcFactory.send($scope.messageToSend);
      $scope.messageToSend = '';
    }

    var addMessages = function(message) {
      $scope.messages.push(message)
      $scope.$apply();
    }
    var addStream = function(stream){
      $scope.remoteStreams.push(stream);
      $scope.$apply();
    }

    //ask for video
    camaraService.getVideo().then(function (s) {
      mediaStream = s;
      streamURL = s.objectURL;
      webrtcFactory.join(s,roomId, randomUsernameService.get(), addStream, addMessages);
    });

    $scope.localStream = function(){
      return $sce.trustAsResourceUrl(streamURL);
    };

    $scope.mute = function () {
      camaraService.mute();
    };

    $scope.stop = function () {
      camaraService.stop();
    };

    //
    // $scope.$on('$routeChangeStart',function () {
    //   camaraService.stop();
    // });

    $scope.remotePeer = [];


  });
