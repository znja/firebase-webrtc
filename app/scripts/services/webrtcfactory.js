'use strict';

/**
 * @ngdoc service
 * @name firebaseApp.webrtcFactory
 * @description
 * # webrtcFactory
 * Factory in the firebaseApp.
 */
angular.module('firebaseApp')
  .factory('webrtcFactory', function ($rootScope, $q, $firebase, $window, config) {
    var stream;
    var roomId;
    var username;
    var myId; //firebase generated key by push method
    var peerConnections = {};
    var iceConfig = config.iceConfig
    var addStreamCB;

    //firebase shinanigens
    var ref;
    var peers;
    var peersArr;
    var signaling;
    var signalingArr;

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
        sendSignal(id, myId, {ice: evnt.candidate});
      };
      pc.onaddstream = function (evnt) {
        console.log('Received new stream' , id, evnt.stream);
        addStreamCB({stream: URL.createObjectURL(evnt.stream)});
      };
      return pc;
    }

    //Make Initial Offer to new peer
    function makeOffer(id) {
      var pc = getPeerConnection(id);
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        sendSignal(id, myId, {sdp: sdp});
      }, function (e) {
        console.log(e);
      },
      { mandatory: { OfferToReceiveVideo: true, OfferToReceiveAudio: true }});
    }

    //manage signal
    function handleMessage(from , data) {
      var pc = getPeerConnection(from);
        if(data.sdp){
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            if (pc.remoteDescription.type == "offer"){
              pc.createAnswer(function (sdp) {
                pc.setLocalDescription(sdp);
                sendSignal(from, myId, {sdp: sdp});
              });
            }
          });
        } else{
          pc.addIceCandidate(new RTCIceCandidate(data.ice));
        }
    }

    //send message to from {../toID/fromId + payload}
    function sendSignal(to, from, data) {
      console.log('to: ' + to + 'from: ' + from + 'data: ' , data);
      ref.child('signaling/' + to + '/' + from).push(data);
    }

    //Get Signaling object and return promise when loaded.
    function getSignaling() {
      signaling = $firebase(ref.child('signaling/' + myId));
      return signaling.$asArray().$loaded().then(function (data) {
        signalingArr = data;
      });
    }

    //Get list of peers connected
    function getPeers() {
      peers = $firebase(ref.child('peers'));
      return peers.$asArray().$loaded().then(function (data) {
          peersArr = data;
        });
    }

    // Watch my signaling object.
    // Returns promise
    function watchSignaling() {
      var d = $q.defer();
      signalingArr.$watch(function(e) {
        //if child added handle message in added record
        if(e.event = 'child_added'){
          var fromId = e.key;
          // get array of messages coming from peer
          var fromMessageArr = $firebase(ref.child('signaling/' + myId + '/' + fromId)).$asArray();
          // watch for any masseges added to the fromPeer message array
          fromMessageArr.$watch(function (e) {
            // when message added call handleMessage function
            if(e.event = 'child_added'){
              // console.log(fromId + ', data: ' , fromMessageArr.$getRecord(e.key));
              handleMessage(fromId , fromMessageArr.$getRecord(e.key));
            }
          });
        }
      });
      d.resolve();
      return d.promise;
    }

    // Watch the peers object returns promise
    function watchPeers() {
      var d = $q.defer();
      peersArr.$watch(function (ref) {
        if(ref.event === 'child_added' && ref.key !== myId){
          console.log('Peer Joined: ', peersArr.$getRecord(ref.key).$value);
          makeOffer(ref.key);
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
    var join = function (s,id, un, addstream) {
      stream = s;
      roomId = id;
      username = un;
      addStreamCB = addstream;
      init(id);
    };


    window.peerConnections = peerConnections;
    return {
      join : join
    };
  });
