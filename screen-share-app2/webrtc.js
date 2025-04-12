const roomId = new URLSearchParams(window.location.search).get("room");
const yourRole = window.location.hash === "#host" ? "host" : "guest";

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const database = firebase.database();
const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

let localStream;
let peerConnection = new RTCPeerConnection(servers);

async function init() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = event => {
    if (remoteVideo.srcObject !== event.streams[0]) {
      remoteVideo.srcObject = event.streams[0];
    }
  };

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      database.ref(`${roomId}/candidates/${yourRole}`).push(JSON.stringify(event.candidate));
    }
  };

  const offerRef = database.ref(`${roomId}/offer`);
  const answerRef = database.ref(`${roomId}/answer`);
  const candidatesRef = database.ref(`${roomId}/candidates`);

  if (yourRole === "host") {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await offerRef.set(JSON.stringify(offer));

    answerRef.on("value", async snapshot => {
      const data = snapshot.val();
      if (data && !peerConnection.currentRemoteDescription) {
        const answer = JSON.parse(data);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
  } else {
    offerRef.on("value", async snapshot => {
      const data = snapshot.val();
      if (data && !peerConnection.currentRemoteDescription) {
        const offer = JSON.parse(data);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await answerRef.set(JSON.stringify(answer));
      }
    });
  }

  const remoteRole = yourRole === "host" ? "guest" : "host";
  candidatesRef.child(remoteRole).on("child_added", snapshot => {
    const candidate = new RTCIceCandidate(JSON.parse(snapshot.val()));
    peerConnection.addIceCandidate(candidate).catch(console.error);
  });
}

init();
