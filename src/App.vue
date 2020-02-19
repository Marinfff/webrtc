<script>
import io from "socket.io-client";

export default {
  name: "App",

  data: () => ({
    socket: io("http://localhost:3000/messages"),
    connection: null,
    constraints: {
      audio: true,
      video: false
    }
  }),

  async mounted() {
    await this.getUserMedia();
    this.createPeerConnection();
    this.awaitOffer();
  },

  methods: {
    createPeerConnection() {
      this.connection = new RTCPeerConnection();
    },
    async createOffer() {
      console.log("create offer");
      try {
        const offer = await this.connection.createOffer();
        await this.connection.setLocalDescription(offer);
        this.connection.onicecandidate = e => {
          this.sendOffer(this.connection.localDescription, e);
        };
        this.awaitAnswer();
      } catch (err) {
        console.log(err);
      }
    },
    async createAnswer() {
      console.log("create answer");
      try {
        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);
        this.connection.onicecandidate = e => {
          this.sendAnswer(this.connection.localDescription, e);
        };
      } catch (err) {
        console.log(err);
      }
    },
    sendOffer(offer, event) {
      this.socket.emit("offer", {
        offer,
        event
      });
    },

    awaitOffer() {
      this.socket.on("offer", data => {
        console.log("await offer");
        this.connection.setRemoteDescription(data.offer);
        this.connection.addIceCandidate(data.candidate);
        this.createAnswer();
      });
    },

    sendAnswer(offer, event) {
      this.socket.emit("answer", {
        offer,
        event
      });
    },

    awaitAnswer() {
      this.socket.on("answer", data => {
        console.log("await answer");
        this.connection.setRemoteDescription(data.offer);
        this.connection.addIceCandidate(data.candidate);
      });
    },

    async getUserMedia() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(
          this.constraints
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>

<template>
  <v-app>
    <div class="pa-5">
      <v-btn @click="createOffer()" dark color="red">Call</v-btn>
      <audio style="opacity: 0" ref="audio" controls></audio>
    </div>
  </v-app>
</template>
