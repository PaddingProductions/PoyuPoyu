class TitleScreen {

    static container = new PIXI.Container();
    static style = new PIXI.TextStyle({
        dropShadow: true,
        dropShadowColor: "#bfbaba",
        fontFamily: "\"Lucida Console\", Monaco, monospace"
    });

    // A constant on how much each button should slide.
    static FLEX = 140;

    static put = function () {
        app.ticker.remove(this.f_slideout);

        this.container.original_x = 0;
        this.Title = new PIXI.Text("PoyuPoyu!", {
            font_size: 28, 
        })
        {
            this.container.addChild(this.Title);
            this.Title.x = 100;
            this.Title.y = 60;
        }

        makeButton(-this.FLEX, 200, 400, 100, 0xeeeeee, "START", this.style, this.FLEX, this.container, ()=>{
            Log("Start!");
                
            this.clear();
            GameScreen.put();
        });
        
        makeButton(-this.FLEX, 300, 400, 100, 0x24b58c, "ONLINE", this.style, this.FLEX, this.container, ()=>{
            Log("Online!");
                
            this.clear();
            ConnectionLoadScreen.put();
            ConnectionManager.start();
        });
        
        makeButton(-this.FLEX, 400, 400, 100, 0x554444, "ABOUT", this.style, this.FLEX, this.container, ()=>{
            this.clear();
            AboutScreen.put();
        });

        this.container.x = -MENU_SWITCH_FLEX;
        app.ticker.add(this.f_slidein)
    }
    static f_slidein = () => {
        this.container.x += (0 - this.container.x) * 0.1;
        if (Math.abs(0 - this.container.x) < 1) {
            this.container.x = 0;
            app.ticker.remove(this.f_slidein);
        }
    }
    static f_slideout = () => {
        this.container.x -= 10;
        if (this.container.x < -MENU_SWITCH_FLEX) {
            this.container.removeChildren();
            app.ticker.remove(this.f_slideout);
        }
    }
    static clear = function () {
        app.ticker.remove(this.f_slidein);
        app.ticker.add(this.f_slideout);
    }
}