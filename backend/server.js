const express = require('express');
const { chats } = require('./data/data');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandlerMiddleware');

dotenv.config();

const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
})

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
    }
})

io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on('setup', (userData) => {
        console.log('setup', userData._id);
        socket.join(userData._id);
        socket.emit('connected');
    })

    socket.on('join chat', (roomId) => {
        socket.join(roomId);
        console.log('user joined the room', roomId);
    })

    socket.on('typing' , (roomId) => {
        socket.in(roomId).emit('typing');
    })
    socket.on('stop typing' , (roomId) => {
        socket.in(roomId).emit('stop typing');
    })

    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log('Chat.users not defined');

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });

    })

    socket.off('setup',() => {
        console.log('setup off');
        socket.leave(userData._id);
    })
});