class AboutScreen {
    
    static container = new PIXI.Container();
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

        this.makeButton(-50, 40, 100, 60, 0x998888, "BACK", () => {
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