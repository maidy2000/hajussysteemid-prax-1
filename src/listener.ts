import jsonBody from "body/json";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { Controller } from "./controller";
import { Database } from "./database";

export class Listener {
  private static readonly HOST = "localhost";

  private readonly server: Server;

  private controller: Controller;

  constructor(private database: Database, private PORT: number) {
    this.controller = new Controller(database);
    this.server = createServer((req, res) => this.handleRequest(req, res));
  }

  listen() {
    this.server.listen(this.PORT, Listener.HOST, () => {
      console.log(
        `${new Date().toLocaleString()} - Server is running on http://${
          Listener.HOST
        }:${this.PORT}`
      );
    });
  }

  handleRequest(req: IncomingMessage, res: ServerResponse) {
    jsonBody(req, (err, body) => {
      const url = new URL(req.url ?? "", `http://0:0`);

      const endpoint = this.controller.endpoints.find(
        (endpoint) =>
          url.pathname === endpoint.route && req.method === endpoint.method
      );

      const response = endpoint?.fn.call(this.controller, { req, res, body });
      res.end(JSON.stringify(response));
    });
  }
}
