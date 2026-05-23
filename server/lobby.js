
class Lobby {

    players = [];
    playerOneDice = 7;
    playerTwoDice = 8;

    constructor(code, password) {
        this.code = code;
        this.password = password;
    }

    addPlayer(player, socket) {
        this.players.push(player);
        player.room = this.code;
        socket.join(this.code);
        console.log(player.name + " joined room " + this.code);


    }

    isFull() {
        if (this.players.length === 2) {
            return true;
        } else {
            return false;
        }
    }

    startGame(io) {

        console.log("game " + this.code + " full. Starting game now...");
        console.log("GAME STARTING");
        io.to(this.code).emit("game-start", {
            name: this.players[0].name,
            firstDice: Math.ceil((Math.random() * 6))
        });

        // k_socket.on("game-start", (gameData) => {
        // console.log("lobby started!");
        // SceneManager.currentScene = multiplayerGameScene;
    }

    sendMoveData(socket, player, moveData) {
        console.log(player.name + " made a move.");
        socket.emit(this.code, moveData);
    }

    isThisYourGuy(player) {
        if (player.room === this.code) {
            console.log("player " + player.name + " belongs to me, Room " + this.code);
            return true;
        }
        return false;
    }


    // printPlayers() {
    //     players.forEach((player) => {
    //         console.log(player.name);
    //     });
    // }

    // emit(io, signal, variable) {
    //     io.to(this.code).emit(signal, variable);
    // }
}


module.exports = Lobby;