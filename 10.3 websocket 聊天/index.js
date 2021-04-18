const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 9999;

app.use(express.static(__dirname + '/webapp'));

io.on('connection', socket => {
  socket.on('greet', data => socket.emit('uppergreet', data.toUpperCase()));
});

http.listen(port, () => console.log('listening on port ' + port));