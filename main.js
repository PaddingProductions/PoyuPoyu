const WIDTH = 820;
const HEIGHT = 540;
const MENU_SWITCH_FLEX = 400;
const GAME_SWITCH_FLEX = 400;

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


app.stage.addChild(TitleScreen.container);
app.stage.addChild(AboutScreen.container);
app.stage.addChild(GameScreen.container);
TitleScreen.put();

