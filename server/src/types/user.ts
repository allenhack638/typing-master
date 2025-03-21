export interface User {
  id: string;
  name: string;
  isAdmin?: boolean;
}
export interface AuthWebSocket extends WebSocket {
  user?: User;
  roomName?: string;

  on(
    event: "message",
    listener: (this: WebSocket, ev: MessageEvent) => void
  ): this;
  on(event: "close", listener: (this: WebSocket, ev: CloseEvent) => void): this;
  on(event: "error", listener: (this: WebSocket, ev: Event) => void): this;
}
