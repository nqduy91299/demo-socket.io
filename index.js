const express = require('express');
const hbs = require('express-handlebars');
const app = express();
require('dotenv').config();
const socketio = require('socket.io');

app.engine('.hbs', hbs({extname: '.hbs'}));
app.set('view engine', '.hbs');



app.use('/chat/:id', (req, res) => {
    res.render('chat')
});
app.get('/chat', (req, res) => {
    res.render('index')
})

app.use('/', (req, res) => {
    res.render('login')
});



const port = process.env.PORT;
const httpServer = app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})

const io = socketio(httpServer);

io.on('connection', (client) => {
    console.log(`Client ${client.id} is connected`);

    client.on('disconnect', () => {
        console.log(`Client ${client.id} is disconnected`)
        client.broadcast.emit('exit-user', {id: client.id, username: client.username});
    })

    client.on('register-username', (username) => {
        client.username = username;
        client.broadcast.emit('register-username', {id: client.id, username: client.username})
    })

    client.on('private message', (data) => {
        io.to(data.to).emit('private message', data);
    })
    client.emit('list-users', Array.from(io.sockets.sockets.values()).map(socket => ({id: socket.id, username: socket.username})));


    client.broadcast.emit('new-user', {id: client.id, username: client.username})
})