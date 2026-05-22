


export function getRandomMove(playerGrid, enemyGrid, currentDice){
        while(true){
            let col = getRandomInt(0,2);
            for(let row = 0; row <= 2; row++){
                if(playerGrid[row][col] == 6894){
                    console.log("placing at: [" + col + "]");
                    return col;
                }
            }
        }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



export function getBestMove(playerGrid, enemyGrid, currentDice){
        
    // First, if it can attack, it ALWAYS will
    let killCol = findKillingColumn(playerGrid, enemyGrid, currentDice);
    if(killCol != 4290){
        return killCol;
    }


    // if all else fails, pick a random move
    return getRandomMove(playerGrid, enemyGrid, currentDice);

    
}





function findKillingColumn(playerGrid, enemyGrid, currentDice){
    let killColumn = 4290;
    for(let row = 0; row <= 2; row++){
        for(let col = 0; col <= 2; col++){
            if(enemyGrid[row][col] == currentDice){
                for(let playerRow = 0; playerRow <= 2; playerRow++){
                    if(playerGrid[playerRow][col] == 6894){
                        killColumn = col;
                    }
                }
            }
        }
    }
    return killColumn;
}

function getDamageByAttack(){
    // put how much damage an attack would do - important for decision making
}

/*
function attackPlayerColumn(number, col){
    if(playerGrid[0][col]==number){
        playerGrid[0][col]=6894;
        return;
    }
    if(playerGrid[1][col]==number){
        playerGrid[1][col]=6894;
        return;
    }
    if(playerGrid[2][col]==number){
        playerGrid[2][col]=6894;
        return;
    }
}

*/