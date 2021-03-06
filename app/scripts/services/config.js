'use strict';

/**
 * @ngdoc service
 * @name firebaseApp.config
 * @description
 * # config
 * Constant in the firebaseApp.
 */
angular.module('firebaseApp')
  .constant('config',
    { firebaseURL: 'https://webrtc-cloud.firebaseio.com/',
      iceServers: {iceServers : [ {url:'stun:stun.l.google.com:19302'},
                  {
                    url: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                  },
                  {
                    url: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                  }
                ]
              }
    });
