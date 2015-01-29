'use strict';

/**
 * @ngdoc service
 * @name firebaseApp.webrtcFactory
 * @description
 * # webrtcFactory
 * Factory in the firebaseApp.
 */
angular.module('firebaseApp')
  .factory('webrtcFactory', function ($window, $q, $firebase, config,localStorageService) {
    var stream;
    var roomId;
    var username = localStorageService.get('userName');
    var myId; //firebase generated key by push method
    var peerConnections = {};
    var iceConfig = config.iceConfig
    var remoteStreams = [];

    //firebase shinanigens
    var ref;
    var peers;
    var peersArr;
    var signaling;
    var signalingObj;

    function getPeerConnection(id) {
      if (peerConnections[id]) {
        return peerConnections[id];
      }
      var pc = new RTCPeerConnection(iceConfig);
      peerConnections[id] = pc;
      if(stream){
        pc.addStream(stream);
        }
      pc.onicecandidate = function (evnt) {
        signalingObj.signal = { from: myId, to: id, ice: evnt.candidate, type: 'ice' };
        signalingObj.$save().then(function (ref) {
          console.log('type Ice sending signal: ', signalingObj.signal);
        });
      };
      pc.onaddstream = function (evnt) {
        console.log('Received new stream' , id, evnt.stream);
        remoteStreams.push({
          id: id,
          stream: URL.createObjectURL(evnt.stream)
        });
      };
      return pc;
    }

    function makeOffer(id) {
      var pc = getPeerConnection(id);
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        console.log('Creating an offer for', id);
        signalingObj.signal = { from: myId, to: id, sdp: sdp, type: 'sdp-offer' };
        signalingObj.$save().then(function(ref) {
          console.log('type sdp-offer sending signal: ', signalingObj.signal);
        });
      }, function (e) {
        console.log(e);
      },
      { mandatory: { OfferToReceiveVideo: true, OfferToReceiveAudio: true }});
    }

    // get list of peers and when some one joins make an offer to start connection
    var managePeers = function (ref) {
      if(ref.event === 'child_added'){
        console.log('Peer Joined: ', peersArr.$getRecord(ref.key).$value);
        if(ref.key !== myId){
          makeOffer(ref.key);
        }
      }else {
        console.log('event: ', e)
      }
    };

    //Get list of peers connected
    function getPeers() {
      var d = $q.defer();
      $firebase(ref.child('peers'))
        .$asArray().$loaded().then(function (data) {
          peersArr = data;
          peersArr.$watch(managePeers);
          d.resolve();
        });
      return d.promise;
    }

    //manage signal
    function handleSignal(data) {
      var pc = getPeerConnection(data.from);
      switch (data.type) {
        case 'sdp-offer':
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            console.log('Setting remote description by offer');
            pc.createAnswer(function (sdp) {
              pc.setLocalDescription(sdp);
              signalingObj.signal = { from: myId, to: data.from, sdp: sdp, type: 'sdp-answer' };
              signalingObj.$save().then(function () {
                console.log('sdp-answer sending signal: ', signalingObj.signal);
              });
            });

          });
          break;
        case 'sdp-answer':
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            console.log('Setting remote description by answer');
          }, function (e) {
            console.error(e);
          });
          break;
        case 'ice':
          if (data.ice) {
            console.log('Adding ice candidates');
            pc.addIceCandidate(new RTCIceCandidate(data.ice));
          }
          break;
      }
    }

    function recievedSignal() {
      //When i get a signal
      signalingObj.$watch(function() {
        if(signalingObj.signal.to === myId){
          console.log('incoming Signal: ', signalingObj.signal);
          handleSignal(signalingObj.signal);
        }
      });

    }


    function init(id) {
      var d = $q.defer();
      //get firebase room reference
      ref = new Firebase(config.firebaseURL + id);

      getPeers().then(function () {
        signaling = $firebase(ref.child('signaling'));
        signaling.$asObject().$loaded().then(function (data) {

            signalingObj = data;

            recievedSignal();

            d.resolve();
          });
      })
      return d.promise;
    }

    //Join Room
    var join = function (s,id,rs) {
      stream = s;
      roomId = id;
      remoteStreams = rs
      init(id).then(function () {

        //get my id if i have already joined the room. else add myself to list of people.
        _.each(peersArr,function(peer) {
          if(peer.$value === username){
            myId = peer.$id;
          }
        })
        if(!myId) {
          var user = {"username": username}
          if (peersArr.length == 0) {
            user.first = true
          }
          peersArr.$add(user).then(function (ref) {
            myId = ref.key();
          });
        }
      });
    };

    var monitor = function(s,id,rs) {
      stream = s;
      roomId = id;
      remoteStreams = rs

      var d = $q.defer();
      //get firebase room reference
      ref = new Firebase(config.firebaseURL + id);
      $firebase(ref.child('peers'))
        .$asArray().$loaded().then(function (data) {
          _.each(data,function(peer) {
            if(peer.first){
              console.log("found it!")
            }
          })
        });
    }

    return {
      join : join,
      monitor : monitor
    };
  });
