let APP_ID = "1a0be0bbd28c484cb6cbb11c034df3c2";

let token = null;
let uid = String(Math.floor(Math.random() * 10000));

let client;
let channel;

let localStream;
let remoteStream;
let peerConection;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

let init = async () => {
  client = await AgoraRTM.createInstance(APP_ID);
  await client.login({ uid, token });

  channel = client.createChannel("main");
  await channel.join();

  channel.on("MemberJoined", handleUserJoined);

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  document.getElementById("user-1").srcObject = localStream;

  createOffer();
};

let handleUserJoined = async (MemberId) => {
  console.log("A new user joined channel");
};

let createOffer = async () => {
  peerConection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConection.addTrack(track, localStream);
  });

  peerConection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack();
    });
  };

  peerConection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log("New ICE candidate", event.candidate);
    }
  };

  let offer = await peerConection.createOffer();
  await peerConection.setLocalDescription(offer);

  console.log("Offer", offer);
};

init();
