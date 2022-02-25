const dx = [0,1,0,-1]; // CW, 0 = up, 1 = right, 2 = down, 3 = right;
const dy = [-1,0,1,0];

let dropCounter = 0;
let dropCounterClears = 0;
const dropAt = 20;
const TUMBLERATE = 4; // the amount of frames it takes for a unit to tumble down.
const POPANIMATIONFRAME = 30;
const FRAMERATE = 60;
const STALL_LIMIT = 5;
const SOFTDROPSPEED = 2;

class Unit {
    frame = 0;

    constructor (x, y, c) {
        this.x = x;
        this.y = y;
        this.gy = y* CELLSIZE;
        this.c = c;
        this.graphics = new PIXI.Graphics();
    }
    refresh = () => {
        this.graphics.clear();
        this.graphics.beginFill(COLORS[this.c]);
        this.graphics.drawCircle((this.x +0.5) *CELLSIZE,this.gy + CELLSIZE/2, CELLSIZE/2);
    }
}

let pair = [null,null];
let rotation = 2;
let units = [];
let board = [];
for (let y=0; y<12; y++) {
    board.push([]);
    for (let x=0; x<6; x++) 
        board[y].push(null);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const max = (a, b) => {
    if (a > b)
        return a;
    return b;
}

let blockFor = async (func) => {
    app.ticker.remove(Logic.loop);
    await func();
    app.ticker.add(Logic.loop);
}

class Logic {
    static movementCooldown = 0;
    static rotationCooldown = 0;
    static gameOver = false;
    static combo = 0;
    
    static start = () => {
        this.gameOver = false;
        app.ticker.add(this.loop);
        this.newPair();
    }
    static stop = () => {
        for (let y=0;y<12;y++) 
            for (let x=0;x<6; x++) 
                board[y][x] = null;
        units = [];
        app.ticker.remove(this.loop);
    }

    static loop = async () => {
        //input 
        let moved = false;
        {
            if (g_input["ArrowLeft"] == true) {
                pair[0].x --;
                pair[1].x --;
                if (this.overlap()) {
                    pair[0].x ++;
                    pair[1].x ++;
                }
                moved = true;
            }
            if (g_input["ArrowRight"] == true) {
                pair[0].x ++;
                pair[1].x ++;
                if (this.overlap()) {
                    pair[0].x --;
                    pair[1].x --;
                }
                moved = true;
            }
            if (g_input["x"]) {
                let nr = (rotation + 1) % 4;
                let diff =  (pair[1].gy % CELLSIZE);

                pair[1].x = pair[0].x + dx[nr];
                pair[1].y = pair[0].y + dy[nr];
                pair[1].gy = (pair[1].y * CELLSIZE) + diff;

                if (this.overlap()) {
                    console.log("cw overlap, rejecting");
                    pair[1].x = pair[0].x + dx[rotation];
                    pair[1].y = pair[0].y + dy[rotation];
                    pair[1].gy = pair[1].y * CELLSIZE + diff;
                } else {
                    if (this.contact()) {
                        console.log("cw contact, removing diff");
                        pair[0].gy = pair[0].y * CELLSIZE;
                        pair[1].gy = pair[1].y * CELLSIZE;
                    }
                    console.log("cw pass");
                    rotation = nr;
                }
                moved = true;
            }
            if (g_input["z"]) {
                let nr = rotation - 1;
                if (nr == -1) nr = 3;
                let diff =  (pair[1].gy % CELLSIZE);

                pair[1].x = pair[0].x + dx[nr];
                pair[1].y = pair[0].y + dy[nr];
                pair[1].gy = (pair[1].y * CELLSIZE) + diff;

                if (this.overlap()) {
                    pair[1].x = pair[0].x + dx[rotation];
                    pair[1].y = pair[0].y + dy[rotation];
                    pair[1].gy = pair[1].y * CELLSIZE + diff;
                } else {
                    if (this.contact()) {
                        pair[0].gy = pair[0].y * CELLSIZE;
                        pair[1].gy = pair[1].y * CELLSIZE;
                    }
                    rotation = nr;
                }
                moved = true;
            }

            if (g_hold["ArrowDown"]) {
                dropCounter += SOFTDROPSPEED;
                pair[0].gy += CELLSIZE / dropAt * SOFTDROPSPEED;
                pair[1].gy += CELLSIZE / dropAt * SOFTDROPSPEED;
            }
        }
        clearInput();


        // gravity
        dropCounter++;
        if (dropCounter >= dropAt || dropCounterClears >= STALL_LIMIT) {
            dropCounterClears = 0;
            dropCounter = 0;
            pair[0].y ++;
            pair[1].y ++;
        }
        // dropping graphics, must be done after logic as "this.contact()" uses the data changed in the logic part.
        if (!this.contact()) {
            pair[0].gy = (pair[0].y + dropCounter/ dropAt) * CELLSIZE;
            pair[1].gy = (pair[1].y + dropCounter/ dropAt) * CELLSIZE;
        } else {
            // lock timer clear on movement
            if (moved) {
                dropCounter = 0;
                dropCounterClears ++;
            }
            pair[0].gy = pair[0].y *CELLSIZE; // align
            pair[1].gy = pair[1].y *CELLSIZE;
        }


        // if drop overlapping with the floor 
        // waiting until it overlaps with the floor makes it have a lock-delay effect.
        if (this.overlap()) {
            pair[0].y --; pair[1].y --; // remove overlap
            pair[0].gy = pair[0].y *CELLSIZE; // align
            pair[1].gy = pair[1].y *CELLSIZE;

            board[pair[0].y][pair[0].x] = pair[0];
            board[pair[1].y][pair[1].x] = pair[1];
        
            if (this.gravity()) {
                // await drop animation
                await blockFor(this.dropAnimation);
            }
            while (this.checkPop()) {
                this.combo ++;
                await blockFor(this.popAnimation);
                // if drop
                if (this.gravity()) {
                    // await drop animation
                    await blockFor(this.dropAnimation);
                }
            }
            this.newPair();
            if (this.gameOver) {
                this.stop();
            }
        }
        // refresh graphics
        GameScreen.refresh();    
    }
    static gravity = () => {
        let changed = false;
        for (let y=10; y>=0; y--) {
            for (let x=0; x<6; x++) {
                if (board[y][x] != null) {
                    let i = 1;
                    for (; y+i < 12; i++) 
                        if (board[y+i][x] != null) 
                            break;
                    
                    if (y+i-1 != y)
                        changed = true;

                    let unit = board[y][x];
                    unit.y = y+i-1;
                    board[y][x] = null;
                    board[y+i-1][x] = unit;
                }
            }
        }
        return changed;
    }
    static checkPop = () => {
        let visited = [];
        let out = false;
        for (let i=0; i<units.length; i++) {
            if (visited.includes(units[i])) continue;

            let group = [];
            let next = [units[i]];
            while (next.length) {
                let curr = next.shift();
                group.push(curr);

                for (let d=0; d<4; d++) {
                    if (curr.y+dy[d] < 0 || curr.y+dy[d] == 12 || curr.x+dx[d] < 0 || curr.x+dx[d] == 6) continue;
        
                    let neighbor = board[curr.y + dy[d]][curr.x + dx[d]];
                    if (neighbor != null) if (!visited.includes(neighbor) && neighbor.c == curr.c) {
                        visited.push(neighbor);
                        next.push(neighbor);
                    }
                }
            }
            if (group.length > 4) {
                out = true;
                for (let k=0; k<group.length; k++) {
                    board[group[k].y][group[k].x] = null;
                    group[k].frame = POPANIMATIONFRAME;
                }
            }
        }
        return out;
    }
    static dropAnimation = async () => {
        let over = true;
        for (let i=0; i<units.length; i++) {
            if (units[i].gy != units[i].y * CELLSIZE) {
                units[i].gy += CELLSIZE/TUMBLERATE;
                over = false;
            }
        }
        if (over)
            return;
        GameScreen.refresh();
        await sleep(Math.floor(1000/FRAMERATE));
        await this.dropAnimation();
    }
    static popAnimation = async () => {
        let over = true;

        // flashing animation
        GameScreen.setCombo(this.combo);
        for (let i=0; i<units.length; i++) {
            if (units[i].frame > 0) {
                over = false;
                if (units[i].frame%2 == 1) 
                    units[i].graphics.clear();
                else 
                    units[i].refresh();
                units[i].frame --;
                if (units[i].frame == 0) {
                    units[i].graphics.clear();
                    units.splice(i,1);
                }
            }
        }
        if (over) {
            GameScreen.setCombo(-1);
            return;
        }

        await sleep(Math.floor(1000/FRAMERATE));
        await this.popAnimation();
    }
    static contact = () => {
        //if floor
        if (pair[0].y >= 11 || pair[1].y >= 11) 
            return true; 
        //if the one below you (y+1) is occupied
        if (board[pair[0].y +1][pair[0].x] != null) 
            return true;
        if (board[pair[1].y +1][pair[1].x] != null) 
            return true;
        return false;
    }
    static overlap = () => {
        //if floor
        if (pair[0].x < 0 || pair[0].x >= 6 || pair[0].y < 0 || pair[0].y >= 12) return true;
        if (pair[1].x < 0 || pair[1].x >= 6 || pair[1].y < 0 || pair[1].y >= 12) return true;  
        //if the one below you (y+1) is occupied
        if (board[pair[0].y][pair[0].x] != null) 
            return true;
        if (board[pair[1].y][pair[1].x] != null) 
            return true;
        return false;
    }

    static newPair = () => {
        if (board[0][3] != null || board[1][3] != null) {
            this.gameOver = true;
            return;
        }
        pair[0] = new Unit(3,0, Math.floor(Math.random() * 4));
        pair[1] = new Unit(3,1, Math.floor(Math.random() * 4));
        units.push(pair[0], pair[1]);
        GameScreen.addToBoard(pair[0].graphics);
        GameScreen.addToBoard(pair[1].graphics);
    }
}
