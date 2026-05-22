class Player {
    room = "none";
    name = "delta 1-1";
    index = 192;
    constructor(name, id, index) {
        console.log("players joined as " + name);
        this.index = index;
        this.id = id;
        this.name = name;
    }
}

module.exports = Player;