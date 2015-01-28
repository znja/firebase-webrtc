'use strict';

/**
 * @ngdoc service
 * @name firebaseApp.camaraService
 * @description
 * # camaraService
 * Service in the firebaseApp.
 */
angular.module('firebaseApp')
  .service('camaraService', function ($window, $q) {

    var constraints = {audio:true, video:true};
    var self = this;
    var stream;
    // Return a promise waiting for the user to accept the use of local media
    self.getVideo = function () {
      var d = $q.defer();
      if(stream){
        return $q.when(stream);
      }else {
        $window.navigator.getUserMedia(constraints, function(s) {
          stream = s;
          //just Used in chorme.
          stream.objectURL = $window.URL.createObjectURL(stream);
          d.resolve(stream);
        }, function(error) {
          d.reject('getUserMedia error: ', error);
        });
      }
      return d.promise;
    };

    self.mute = function () {
      if(stream){
        stream.getAudioTracks()[0].enabled = !(stream.getAudioTracks()[0].enabled);
      }
    };
    self.stop = function () {
      if(stream){
        stream.getVideoTracks()[0].enabled = !(stream.getVideoTracks()[0].enabled);
      }
    };
  });
