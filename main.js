const WIDTH = 820;
const HEIGHT = 540;
const MENU_SWITCH_FLEX = 400;
const GAME_SWITCH_FLEX = 400;

const BACK_BUTTON_FLEX = 50;
const BACK_BUTTON_STYLE = new PIXI.TextStyle({
    fontSize: 14,
    fontFamily: "\"Lucida Console\", Monaco, monospace",
    wordWrap: true,
    wordWrapWidth: 400,
});

const app = new PIXI.Application({
    antialias: true,
    autoDensity: true,
    backgroundColor: 0x1099bb,
    resolution: devicePixelRatio,
    width: WIDTH,
    height: HEIGHT,
});
document.body.appendChild(app.view);
app.stage.interactive = true;
app.ticker.start();

// logger width: 18, fontSize 14.
const LOG_WIDTH = 18;
const logs = [];
const logText = app.stage.addChild(new PIXI.Text('--This is the log-', {
    fontSize: 14,
}));
logText.position.set(WIDTH- 14*LOG_WIDTH,0);
app.stage.addChild(logText);

function Log (str) {
    
    let i = LOG_WIDTH;
    while (str.length > i) {
        str = str.slice(i-20, i) + "\n" + str.slice(i);
        i += LOG_WIDTH;
    }
    logs.push(str);
    if (logs.length > 30) {
        while (logs.length > 30) {
            logs.shift();
        }
    }
    // Update logText
    logText.text = logs.join('\n');
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

g_input = {};
g_hold = {};
addEventListener("keydown", (ev) => {
    g_input[ev.key] = true;
    g_hold[ev.key] = true;
});
addEventListener("keyup", (ev) => {
    g_hold[ev.key] = false;
});
const clearInput = () => {
    g_input = {};
}

makeButton = (x,y,width,height,color,str,style,flex,parent,h) => {
    let button = new PIXI.Container();
    button.x = x;
    button.y = y;
    button.original_x = button.x;
    parent.addChild(button);

    let rect = new PIXI.Graphics();
    rect.beginFill(color);    
    rect.drawRect(0,0,width,height);
    rect.zIndex = 1;

    let text = new PIXI.Text(str, style);
    text.anchor.set(1, 0.5);
    text.x = width * 0.9;
    text.y = (height)/2;
    text.zIndex = 1;

    button.addChild(rect);
    button.addChild(text);

    button.interactive = true;
    button.buttonMode = true;

    var fover = () => {
        button.x += ((button.original_x+ flex) - button.x) * 0.1;
        if (Math.abs(button.x - (button.original_x + flex)) < 1) {
            button.x = button.original_x+ flex;
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

app.stage.addChild(TitleScreen.container);
app.stage.addChild(AboutScreen.container);
app.stage.addChild(GameScreen.container);
app.stage.addChild(ConnectionLoadScreen.container);
app.stage.addChild(OnlineScreen.container);
TitleScreen.put();

