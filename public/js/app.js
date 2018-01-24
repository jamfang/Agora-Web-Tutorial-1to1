var client, localuid, localStream, remoteStream, screenSharingStream, camera, microphone;
var audioMute = false;
var videoMute = false;

$(document).ready(function() {
  if(!AgoraRTC.checkSystemRequirements()) {
    alert("Error: Your browser does not support WebRTC!");
  }
  
  initializeClient(); // Tutorial Step 1
});

// Tutorial Step 1
function initializeClient() {
  client = AgoraRTC.createClient({mode: 'h264_interop'});
  // Set mode: h264_interop for Safari interop

  $.get('/app_id', function(appId) {
  // Get the App Id from the node.js server
    client.init(appId, function (obj) {
      console.log("AgoraRTC client initialized");

      joinChannel();      // Tutorial Step 2
    
    }, function (err) {
      console.log("AgoraRTC client initialization failed", err);
    });
  });
}

// Tutorial Step 2
function joinChannel() {
  var channel_name = "demoChannel1";

  client.join(null, channel_name, null, function(uid) {
    localuid = uid;
  // Join channel "demoChannel1"
    console.log("Uid: " + localuid + " joined channel: " + channel_name + " successfully");

    initializeLocalStream(); // Tutorial Step 3
    registerStreamAddedEventHandler(); // Tutorial Step 6
    registerStreamRemovedEventHandler(); // Tutorial Step 8
    registerPeerMuteAudioVideoEventHandler(); // Tutorial Step 13

  }, function(err) {
      console.log("Join channel failed", err);
  });
}

// Tutorial Step 3
function initializeLocalStream() {
  localStream = AgoraRTC.createStream({streamID: localuid, audio: true, video: true, screen: false});
  localStream.setVideoProfile('720p_3');

  localStream.init(function() {
      console.log("Local stream initialized");

      publishLocalStream(); // Tutorial Step 4
      renderLocalStream(); // Tutorial Step 5

  }, function(err) {
      console.log("Local stream initialization failed", err);
  });

  // The user has granted access to the camera and mic.
  localStream.on("accessAllowed", function() {
    console.log("User has granted camera and microphone access");
  });

  // The user has denied access to the camera and mic.
  localStream.on("accessDenied", function() {
    console.log("User has denied access to cmamera and microphone");
  });
}

// Tutorial Step 4
function publishLocalStream() {
  client.publish(localStream, function (err) {
    console.log("Publish local stream failed, error: " + err);
  });
  
  client.on('stream-published', function (evt) {
    console.log("Published local stream successfully");
  });
}

// Tutorial Step 5
function renderLocalStream() {
  localStream.play('local-video');
}

// Tutorial Step 6
function registerStreamAddedEventHandler() {
  client.on('stream-added', function (evt) {
    remoteStream = evt.stream;
    console.log("New stream added: " + remoteStream.getId());

    subscribeRemoteStream(); // Tutorial Step 7
  });
}

// Tutorial Step 7
function subscribeRemoteStream() {
  client.subscribe(remoteStream, function (err) {
    console.log("Subscribe stream failed", err);
  });
  client.on('stream-subscribed', function (evt) {
    remoteStream = evt.stream;
    console.log("Subscribed to remote stream successfully: " + remoteStream.getId());
    
    renderRemoteStream(); // Tutorial Step 8
  });
}

// Tutorial Step 8
function renderRemoteStream() {
  remoteStream.play('remote-video');
}

// Tutorial Step 9
function registerStreamRemovedEventHandler() {
  client.on('stream-removed', function (evt) {
    remoteStream = evt.stream;
    remoteStream.stop();
    console.log("Remote stream is removed " + remoteStream.getId());
  });
  client.on('peer-leave', function (evt) {
    remoteStream = evt.stream;
    if (remoteStream) {
      remoteStream.stop();
      console.log(evt.uid + " left from this channel");
    }
  });
}

// Tutorial Step 10
function onEndCallButtonClicked() {
  localStream.stop();
  localStream.close();

  client.leave(function () {
    console.log("Leave channel succeeded");
  }, function (err) {
    console.log("Leave channel failed");
  });
}

// Tutorial Step 11
function onMuteButtonClicked() {
  audioMute = !audioMute;
  if (audioMute) {
    localStream.disableAudio();
    document.getElementById('mute-button').src="images/unmute.png";
  } else {
    localStream.enableAudio();
    document.getElementById('mute-button').src="images/mute.png";
  }
}

// Tutorial Step 12
function onVideoMuteButtonClicked() {
  videoMute = !videoMute;
  if (videoMute) {
    localStream.disableVideo();
    document.getElementById('video-mute-button').src="images/cameraon.png";
  } else {
    localStream.enableVideo();
    document.getElementById('video-mute-button').src="images/cameraoff.png";
  }
}

// Tutorial Step 13
function registerPeerMuteAudioVideoEventHandler() {
  client.on('mute-audio', function(evt) {
    var peeruid = evt.uid;
    console.log("mute audio:" + peeruid);
  });
  client.on('unmute-audio', function (evt) {
    var peeruid = evt.uid;
    console.log("unmute audio:" + peeruid);
  });
    client.on('mute-video', function (evt) {
    var peeruid = evt.uid;
    console.log("mute video" + peeruid);
  });
  client.on('unmute-video', function (evt) {
    var peeruid = evt.uid;
    console.log("unmute video:" + peeruid);
  });
}