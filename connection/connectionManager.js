const SERVER_ADDR = "ws://localhost:8080";

class ConnectionManager {
    static ws;
    static wsMessageBuffer;

    static start = () => {
        this.ws = new WebSocket('ws://localhost:8080');

        this.ws.addEventListener('open', async (event) => {
            this.ws.send('register');
            Log("connected");
            this.id = await this.getMessage(); // supposedly the ID.
            Log(`ID: ${this.id}`);

            ConnectionLoadScreen.clear();
            OnlineScreen.put();
        });
        this.ws.addEventListener('error', (err) => {
            Log(err);
            OnlineScreen.clear();
            ConnectionLoadScreen.clear();
            TitleScreen.put();
        });
        this.ws.addEventListener('close', (ev) => {
            Log("ws closed");
            OnlineScreen.clear();
            ConnectionLoadScreen.clear();
            TitleScreen.put();
        });
        this.ws.addEventListener('message', (ev) => {
            Log(`received: ${ev.data}`);
            this.wsMessageBuffer = ev.data;
        });

    }

    static stop = () => {
        this.ws.close();
    }

    static getMessage = async () => {
        while(this.wsMessageBuffer == null) 
            await sleep(1);
        let msg = this.wsMessageBuffer.slice(0);
        this.wsMessageBuffer = null;
        return msg;
    }
}