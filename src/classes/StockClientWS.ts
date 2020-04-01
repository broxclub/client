const STOCKS = 'stocks';

type TCallback = (props: object) => void;

class StockClientWS {
  private commandId: number = 0;
  protected wsUrl: string = '';
  private ws: WebSocket | null = null;
  private channels: Map<number, TCallback> = new Map();

  public wsSend(commandId: number, command: string, props?: object) {
    this.ws!.send(JSON.stringify(props ? [commandId, command, props] : [commandId, command]));
  }

  private sendMessage(command: string, props: object) {
    if (this.ws!.readyState === 1) {
      const commandId = this.nextCommandId;
      this.wsSend(commandId, command, props);
      return commandId;
    }
  }

  public subscribeMarkets(markets: string[], callback: TCallback) {
    const invocationId = this.sendMessage(STOCKS, markets);
    if (invocationId) {
      this.channels.set(invocationId, callback);
      return invocationId;
    }
  }

  public unsubscribe(invocationId: number) {
    if (this.channels.has(invocationId)) {
      this.wsSend(invocationId, 'terminate');
      this.channels.delete(invocationId);
    }
  }

  public connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.wsUrl}/marketdata`);
      this.ws.onopen = (e) => {
        resolve();
        setInterval(() => {
          this.wsSend(0, 'ping');
        }, 3000);
      };

      this.ws.onmessage = (e) => {
        try {
          const [id, command, props] = JSON.parse(e.data);

          switch (command) {
            case STOCKS:
              if (this.channels.has(id)) {
                this.channels.get(id)!(props);
              }
              break;
          }
        } catch (e) {
          console.error(e);
        }
      };

      this.ws.onclose = (e) => {
        if (e.wasClean) {
          console.log('Connection normally closed');
        } else {
          console.log('Connection terminated');
        }
      };
    });
  }

  private get nextCommandId() {
    return ++this.commandId;
  }
}

export default StockClientWS;
