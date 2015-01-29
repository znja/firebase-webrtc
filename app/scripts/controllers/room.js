'use strict';

/**
 * @ngdoc function
 * @name firebaseApp.controller:RoomCtrl
 * @description
 * # RoomCtrl
 * Controller of the firebaseApp
 */
angular.module('firebaseApp')
  .controller('RoomCtrl', function ($scope, $routeParams, $sce, $firebase, config, webrtcFactory, camaraService ) {
    var params = $routeParams.id.split("?");
    var roomId = params[0]
    var monitor = params[1]

    var ref = new Firebase(config.firebaseURL + '/room' + roomId);
    var sRef = ref.child('signaling');

    var parent = $firebase(ref); //Reference to parent
    var mediaStream; //save Local media stream object
    var streamURL; //save locar media stream url (needed for chrome)

    $scope.remoteStreams = [];


    // Wait till object is loaded from Firebase to bind data
    parent.$asObject().$loaded().then(function (data) {
      $scope.session = data;
    });

    //ask for video
    camaraService.getVideo().then(function (s) {
      mediaStream = s;
      streamURL = s.objectURL;
      if (monitor === "monitor") {
        webrtcFactory.monitor(s,roomId, $scope.remoteStreams);
      } else {
        webrtcFactory.join(s,roomId, $scope.remoteStreams);
      }
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

    $scope.remotePeer = [];


  });
