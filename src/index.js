const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage} = require('./utils/messages.js')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))



io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options,callback) => {
        
        const {error, user} = addUser({id: socket.id,...options})
        if (error) {
            return callback(error)
        }
    
    socket.join(user.room)
    socket.to(user.room).emit("roomData",{
        users: getUsersInRoom(user.room),
        room: user.room
    })
    socket.emit('message', generateMessage("Admin", "!welCome"))
    socket.broadcast.to(user.room).emit("message", generateMessage("Admin", ` ${user.username} has joined`))
    callback()
    })
    

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)
        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        
        io.to(user.room).emit("message", generateMessage(user.username, message))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit("message", generateMessage(user.username, `${user.username} has left.`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }
    })

    socket.on("send-location", (coords,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage" , generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    
    //     io.emit('countUpdated', count)
    // })
    
})


// let count = 0

// io.on('connection', (socket) => {
//     console.log('New WebSocket connection')

//     socket.emit('countUpdated', count)

//     socket.on('increment', () => {
//         count++
//         io.emit('countUpdated', count)
//     })
// })

// server.listen(port, () => {
//     console.log(`Server is up on port ${port}!`)
// })



server.listen(port, () => {
    console.log(`server is up and lisning to ${port}`)
})
