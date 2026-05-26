const express = require('express');
const http = require('http');
const { Socket } = require('socket.io-client');
const app = express();
const Player = require('./player');
const Lobby = require('./lobby');

const server = http.createServer(app);
//const io = new Server(server);
const io = require("socket.io")(server, {
    cors: {
        origin: "*", // Allows connections via your Nginx proxy from any source
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

const players = [];
const lobbies = [];
// lobbies.push(new Lobby("JKLM", "1234"));
// console.log("lobbies: " + lobbies.length);

function getPlayerIndexByID(id) {
    for (let player of players) {
        if (player.id == id) {
            console.log("player matched ID " + id);
            console.log("indicks: " + player.index);
            return player.index; // ✅ This exits the function properly
        } else {
            console.log("Player ID mismatch");
        }
    }
    return -1; // Or another default value if player not found
}
app.get('/', (req, res) => {
    res.send('Server is running');
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // // Broadcast a message to all connected clients
    // socket.on('playerMove', (data) => {
    //     socket.broadcast.emit('playerMove', data);
    // });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        players.splice(getPlayerIndexByID(socket.id), 1);
    });

    // socket.on("test", (msg) => {
    //     console.log("test status: " + msg);
    //     io.emit("test-two", "if you can read this the test worked");
    // });

    socket.on("join-lobby", (code, name) => {
        let playerDuplicate = false;
        let playerJoining = null;
        players.forEach((playerEach) => {
            if (playerEach.id === socket.id) {
                console.log("player duplicate: " + name);
                playerDuplicate = true;
            }
        });
        if (playerDuplicate) {
            return; // TODO make duplicates only apply to same room, and warn player they are a duplicate
        }
        playerJoining = new Player(name, socket.id, players.length);
        // players.push(playerJoining);

        console.log("player " + name + " attempt to log onto lobby " + code + ".");
        lobbies.forEach((lobby, index) => {
            if (code == lobby.code) {
                console.log("lobby code match.");
                players.push(playerJoining);
                lobby.addPlayer(playerJoining, socket);
                //lobby.printPlayers();
                //io.to("JKLM").emit("test-room", "skib");
                //lobby.emit(io, "test-room", "skib");
                socket.emit("suckies-join", {
                    code: lobby.code,
                    password: lobby.password,
                    players: lobby.players.map(player => ({ name: player.name, id: player.id, index: player.index })), // Send as plain objects,
                    index: index
                });
                if (lobby.isFull()) {
                    lobby.startGame(io);
                }
            } else {
                console.log("lobby code mismatch.");
                console.log(code + " " + lobby.code);
            }
        });

        //io.emit("test-two", "if you can read this the test worked");
    });

    socket.on("create-lobby", (name) => {

        let playerJoining = new Player(name, socket.id, players.length);
        players.push(playerJoining);


        let index = getPlayerIndexByID(playerJoining.id);
        let code = generateLetterCode();

        let lobby = new Lobby(code, "1234");

        console.log("player " + playerJoining.name + " attempt to create lobby " + code + ".");
        lobby.addPlayer(playerJoining, socket);
        lobbies.push(lobby);
        socket.emit("suckies-join", {
            code: lobby.code,
            password: lobby.password,
            players: lobby.players.map(player => ({ name: player.name, id: player.id, index: player.index })), // Send as plain objects,
            index: index
        });

    });


    socket.on("player-move", (moveInformation) => {
        console.log("player moved at " + moveInformation.colPlaced);
        console.log("emitting move to " + moveInformation.roomCode);
        io.to(moveInformation.roomCode).emit("enemy-move", (moveInformation));
        // socket.emit("enemy-move", (moveInformation));
    });


    /*
function sendMoveToServer(col, dice){
    const moveInformation = {
        colPlaced: col,
        dicePlaced: col,
        roomCode: GameManager.roomCode,
        playerOneMoved: GameManager.playerOne
    }
    k_socket.emit("player-move", (moveInformation));
}
    
    */

});



function generateLetterCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        code += letters.charAt(randomIndex);
    }

    return code;
}


process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (text) => {
    const command = text.trim();
    if (command === 'status') {
        console.log('Server is running smoothly.');
    } else if (command === 'stop') {
        console.log('Stopping server...');
    } else if (command === 'clearlobbies') {
        console.log('clearing lobbies');
        lobbies.length = 0;
    } else if (command === 'atombomb') {
        console.log("bombs away");

        for (let col = 0; col <= 2; col++) {
            for (let i = 0; i < 3; i++) {
                io.emit("enemy-move", {
                    colPlaced: col,
                    dicePlaced: 999,
                    roomCode: "AAAA",
                    playerOneMoved: false,
                });
            }
        }
        for (let col = 0; col <= 2; col++) {
            for (let i = 0; i < 3; i++) {
                io.emit("enemy-move", {
                    colPlaced: col,
                    dicePlaced: 999,
                    roomCode: "AAAA",
                    playerOneMoved: true,
                });
            }
        }
    } else if (command === 'hiroshima') {
        console.log("bombs away");

        io.emit("nuked");
    }
});



server.listen(PORT, () => {
    console.log(`Server is running lad`);
});
