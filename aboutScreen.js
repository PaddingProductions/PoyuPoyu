class AboutScreen {
    
    static container = new PIXI.Container();
    static style = new PIXI.TextStyle({
        fontSize: 14,
        fontFamily: "\"Lucida Console\", Monaco, monospace",
        wordWrap: true,
        wordWrapWidth: 400,
    });

    static FLEX = 50;

    static put = function () {
        app.ticker.remove(this.f_slideout);


        this.container.original_x = 0;
        this.Title = new PIXI.Text("About:", {
            font_size: 28, 
        })
        {
            this.container.addChild(this.Title);
            this.Title.x = 100;
            this.Title.y = 60;
        }
        this.text = new PIXI.Text("Just a web version Puy*Puy*, hopefully I finish before I loose interest.", this.style);
        {
            this.container.addChild(this.text);
            this.text.x = 50;
            this.text.y = 160;
        }

        makeButton(-50, 40, 100, 60, 0x998888, "BACK", BACK_BUTTON_STYLE, BACK_BUTTON_FLEX, this.container, () => {
            this.clear();
            TitleScreen.put();
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