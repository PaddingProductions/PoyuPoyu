const CELLSIZE = 40;
const COLORS = [0x8205ff, 0xff0000, 0xffff00, 0x0000ff];
const COMBO_FADE_RATE = 60;

class GameScreen {
    static container = new PIXI.Container();
    static boarder = new PIXI.Container();
    static board = new PIXI.Graphics();
    
    static COUNTDOWN_STYLE = new PIXI.TextStyle({
        fontSize: 22,
        fontFamily: "\"Lucida Console\", Monaco, monospace",
        fill: "#ffad1f",
    });
    
    static style = new PIXI.TextStyle({
        fontSize: 14,
        fontFamily: "\"Lucida Console\", Monaco, monospace",
        wordWrap: true,
        wordWrapWidth: 400,
    });

    static FLEX = 50;

    static makeButton = (x,y,width,height,color,str,h) => {
        let button = new PIXI.Container();
        button.x = x;
        button.y = y;
        button.original_x = button.x;
        this.container.addChild(button);

        let rect = new PIXI.Graphics();
        rect.beginFill(color);    
        rect.drawRect(0,0,width,height);
        rect.zIndex = 1;

        let text = new PIXI.Text(str, this.style);
        text.anchor.set(1, 0.5);
        text.x = width * 0.9;
        text.y = (height)/2;
        text.zIndex = 1;

        button.addChild(rect);
        button.addChild(text);

        button.interactive = true;
        button.buttonMode = true;

        var fover = () => {
            button.x += ((button.original_x+ this.FLEX) - button.x) * 0.1;
            if (Math.abs(button.x - (button.original_x + this.FLEX)) < 1) {
                button.x = button.original_x+ this.FLEX;
                app.ticker.remove(fover);
            }  
        }
        var fout = () => {
            button.x += (button.original_x - button.x) * 0.1;
            if (Math.abs(button.original_x - button.x) < 1) {
                button.x = button.original_x;
                app.ticker.remove(fout);
            }
        }
        button.on('click', h);
        button.on('pointerover', ()=>{
            app.ticker.remove(fout);
            app.ticker.add(fover);
        });

        button.on('pointerout', ()=>{
            app.ticker.remove(fover);
            app.ticker.add(fout);
        });

        return button;
    }
    static put = function () {
        app.ticker.remove(this.f_slideout);

        // for sliding effects.
        this.container.original_x = 0;

        // back button
        this.makeButton(-50, 40, 100, 60, 0x998888, "BACK", () => {
            this.clear();
            TitleScreen.put();
        });

        // Sets up board container, Boarder, Next boxes, Points display and grid.
        {
            this.boarder.x = 100; 
            this.boarder.y = 20;
            this.boarder.addChild(this.board);
            this.board.zIndex = 10;
            
            let graphics = new PIXI.Graphics;
            {
                // BOARDER
                let lineWidth = 4;
                graphics.beginFill(0x0047a3);
                graphics.lineStyle(4,0xeeeeee);
                graphics.drawRect(-lineWidth, -lineWidth, 6 *CELLSIZE + 2*lineWidth,12 *CELLSIZE +2*lineWidth);


                // GRID
                graphics.lineStyle(2, 0xd327d);
                for (let y=1; y<12; y++) {
                    graphics.moveTo(0, CELLSIZE * y);
                    graphics.lineTo(CELLSIZE * 6, CELLSIZE * y);
                }
                for (let x=1; x<6; x++) {
                    graphics.moveTo(CELLSIZE * x, 0);
                    graphics.lineTo(CELLSIZE * x, CELLSIZE * 12);
                }

                // NEXT BOX
                graphics.beginFill(0x0047a3);
                graphics.lineStyle(4,0xeeeeee);
                graphics.drawRect(6.5 *CELLSIZE, 40, 1 *CELLSIZE +4*lineWidth, 2 *CELLSIZE +4*lineWidth);


                // POINTS 
                let pointsText = new PIXI.Text("POINTS", {
                    fontSize: 14,
                    fontFamily: "\"Lucida Console\", Monaco, monospace",
                    fill: 0xeeeeee,
                });
                pointsText.x = CELLSIZE * 6 + 20;
                pointsText.y = CELLSIZE * 12 - 100;
                graphics.addChild(pointsText);

                // COMBO TEXT 
                this.comboText = new PIXI.Text("", {
                    fontSize: 20,
                    fontFamily: "\"Lucida Console\", Monaco, monospace",
                    fill: 0xffbf00,
                });
                this.comboText.x = CELLSIZE * 6 + 20;
                this.comboText.y = CELLSIZE * 12 - 300;
                graphics.addChild(this.comboText);
            }
            this.boarder.addChild(graphics);
            this.boarder.sortChildren();
        }
        this.container.addChild(this.boarder);

        this.countdown = new PIXI.Text('READY', this.COUNTDOWN_STYLE);
        this.countdown.anchor.set(0.5,0.5);
        this.countdown.x = 3*CELLSIZE;
        this.countdown.y = 5*CELLSIZE;
        this.boarder.addChild(this.countdown);


        this.container.y = -GAME_SWITCH_FLEX;
        app.ticker.add(this.f_slidein);
    }
    static f_slidein = () => {
        this.container.y += (0 - this.container.y) * 0.1;
        if (Math.abs(0 - this.container.y) < 1) {

            // stops tick, begins countdown ticker.
            this.container.y = 0;
            app.ticker.remove(this.f_slidein);


            let start = Date.now();
            let f_countdown = () => {
                if (this.countdown.text == "GO") {
                    if (Date.now() - start > 1500) {
                        // stop
                        this.countdown.destroy();
                        app.ticker.remove(f_countdown);
                    }
                // 1 sec later
                } else if (Date.now() - start > 1000) {
                    this.countdown.text = "GO";
                    // start logic
                    Logic.start();
                }
                
            }
            app.ticker.add(f_countdown);
        }
    }
    static f_slideout = () => {
        this.container.y -= 10;
        if (this.container.y < -GAME_SWITCH_FLEX) {
            this.container.removeChildren();
            // clear graphics, as they will respawn momentarily. 
            this.board.removeChildren();
            app.ticker.remove(this.f_slideout);
        }
    }
    static clear = () => {
        Logic.stop();
        app.ticker.remove(this.f_slidein);
        app.ticker.add(this.f_slideout);
    }
    static addToBoard = (c) => {
        this.board.addChild(c);
    }
    static setCombo = function (combo) {
        if (combo == -1) {
            let comboFade_f = async () =>{
                await sleep (1000);
                this.comboText.alpha -= 1 / COMBO_FADE_RATE;
                if (this.comboText.alpha <= 0) {
                    this.comboText.text = "";
                    this.comboText.alpha = 1;
                    app.ticker.remove(comboFade_f);
                }
            }
            app.ticker.add(comboFade_f);
            return;
        } 
        this.comboText.text = "Combo " + String(combo);
    }
    static refresh = function () {
        this.board.clear();

        for (let i=0; i<units.length; i++) {
            units[i].refresh();
        }
        //score

        //next
    }
}