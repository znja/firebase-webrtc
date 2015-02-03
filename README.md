# firebase-webrtc
Base Del Fuego WebRTC app

## Firebase Structure:
```JSON
{
  "session_id": {
    "peers": [
      {
        "peer_id": {}
      },
      {
        "peer_id": {}
      }
    ],
    "signaling": [
      {
        "to_user_id": [
          {
            "from_user_id": [
              {
                "message_id": {
                  "type": "",
                  "ice_or_sdp": ""
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```
