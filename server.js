const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};
const roomCodeMap = {};
function getAllConnectedClients(roomId) {

    const clientsSocketdIds = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const clients = [];

    // for (let i = 0; i < clientsSocketdIds.length; i += 2) {
    //     clients.push({
    //         socketId:clientsSocketdIds[i],
    //         username:userSocketMap[clientsSocketdIds[i]],
    //     });
    //     // console.log("i",i,"clientsocketid",clientsSocketdIds[i]);
    // }

    for (const socketId of clientsSocketdIds) {
        clients.push({
            socketId,
            username: userSocketMap[socketId],
        });
    }

    // console.log(userSocketMap);

    // console.log("clientsSocketdIds", clientsSocketdIds);
    // console.log("clients",clients);

    // // Map
    // return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    //     (socketId) => {
    //         return {
    //             socketId,
    //             username: userSocketMap[socketId],
    //         };
    //     }
    // );
    return clients;
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {

        // chatgpt----------------start
        // Disconnect previous socket if the same username joins again
        for (const [id, user] of Object.entries(userSocketMap)) {
            if (user === username) {
                io.sockets.sockets.get(id)?.disconnect();
                // console.log(io.sockets.sockets);
                // console.log(id, "Disconnected");
                delete userSocketMap[id];
            }
        }
        // chatgpt----------------end


        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);

        // console.log("clients", clients);
        // console.log("usesocketmap", userSocketMap);

        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });

        // Send the current code state to the new user
        if (roomCodeMap[roomId] !== undefined) {
            // console.log("Room id",roomId,"room code",roomCodeMap[roomId]);
            // io.to(socket.id).emit(ACTIONS.CODE_CHANGE, { code: roomCodeMap[roomId] });
        } else {
            roomCodeMap[roomId] = '';
            // console.log("Room id",roomId,"room code",roomCodeMap[roomId]);
        }
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {

        // console.log("code in server:", code);

        // const clients = getAllConnectedClients(roomId);
        // console.log("socketid sender", socket.id);
        // console.log("room id", roomId, "clients", clients);

        // clients.forEach(({ socketId }) => {
        //     if (socketId !== socket.id) {
        //         console.log(socketId);
        //         io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
        //     }
        // });
        roomCodeMap[roomId] = code; // Update the latest code for the room
        // console.log("roomid",roomId,"new code",roomCodeMap[roomId]);
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
        // // console.log("socket.in(roomId)",socket.in(roomId));
    });

    // socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, roomId }) => {
        // console.log("ON sync code --> code:", roomCodeMap[roomId], "for socketid", socketId);
        // if (code !== null){
        // console.log("event emitted for", socketId, "with Code", roomCodeMap[roomId]);
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code: roomCodeMap[roomId] });
        // }
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));