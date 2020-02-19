module.exports = app => {
  app.io.of("/messages").on("connection", socket => {
    socket.on("offer", data => {
      socket.broadcast.emit("offer", data);
    });
    socket.on("answer", data => {
      socket.broadcast.emit("answer", data);
    });
  });
};
