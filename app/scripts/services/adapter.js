'use strict';

/**
 * @ngdoc service
 * @name firebaseApp.adapter
 * @description
 * # adapter
 * Factory in the firebaseApp.
 */
angular.module('firebaseApp')
  .factory('adapter', function ($window) {
    //Adapter for cross browser compatibility (maybe should be something in angular)
    return {
      RTCPeerConnection : ($window.RTCPeerConnection || $window.webkitRTCPeerConnection || $window.mozRTCPeerConnection),

      RTCIceCandidate : ($window.RTCIceCandidate || $window.mozRTCIceCandidate || $window.webkitRTCIceCandidate),

      RTCSessionDescription : ($window.RTCSessionDescription || $window.mozRTCSessionDescription || $window.webkitRTCSessionDescription),

      getUserMedia : ($window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia || $window.navigator.mozGetUserMedia)
    };
  });
