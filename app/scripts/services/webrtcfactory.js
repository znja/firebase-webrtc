'use strict';

/**
 * @ngdoc service
 * @name firebaseApp.webrtcFactory
 * @description
 * # webrtcFactory
 * Factory in the firebaseApp.
 */
angular.module('firebaseApp')
  .factory('webrtcFactory', function ($rootScope, $q, $firebase, config) {
    var stream;
    var roomId;
    var username;
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

    //Make Initial Offer to new peer
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

    //Get Signaling object
    function getSignaling() {
      signaling = $firebase(ref.child('signaling'));
      return signaling.$asObject().$loaded().then(function (data) {
          signalingObj = data;
        });
    }

    //Get list of peers connected
    function getPeers() {
      peers = $firebase(ref.child('peers'))
      return peers.$asArray().$loaded().then(function (data) {
          peersArr = data;
        });
    }

    // Watch the signaling object returns promise
    function watchSignaling() {
      var d = $q.defer();
      signalingObj.$watch(function() {
        if(signalingObj.signal.to === myId){
          console.log('incoming Signal: ', signalingObj.signal);
          handleSignal(signalingObj.signal);
        }
      });
      d.resolve();
      return d.promise;
    }

    // Watch the peers object returns promise
    function watchPeers() {
      var d = $q.defer();
      peersArr.$watch(function (ref) {
        if(ref.event === 'child_added'){
          if(ref.key !== myId){
            console.log('Peer Joined: ', peersArr.$getRecord(ref.key).$value);
            makeOffer(ref.key);
          }
        }else {
          console.log('event: ', ref);
        }
        d.resolve();
      });
      return d.promise;
    }

    // Add myself to peers list returns promise
    function addToPeersList() {
      return peers.$set(myId, username);
    }

    function init(id) {
      //get firebase room reference
      ref = new Firebase(config.firebaseURL + id);
      myId = uuid.v1();

      var groupPromise = $q.all([getSignaling(), getPeers()])
        .then( watchSignaling )
        .then( addToPeersList )
        .then( watchPeers )
    }

    //Join Room
    var join = function (s,id, rs, un) {
      stream = s;
      roomId = id;
      remoteStreams = rs;
      username = un;
      init(id);
    };


    window.peerConnections = peerConnections;
    return {
      join : join
    };
  });
