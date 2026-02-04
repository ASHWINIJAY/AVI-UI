import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

let connection = null;
let startPromise = null;

export function getLocationConnection() {
  if (connection) return startPromise;

  connection = new HubConnectionBuilder()
    .withUrl("https://avi-app.co.za/AVIapi/hubs/location", {
      withCredentials: true,
      accessTokenFactory: () => localStorage.getItem("token"),
    })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  // Start connection and store the promise
  startPromise = connection.start()
    .then(() => {
      console.log("📡 SignalR Connected");
      return connection;
    })
    .catch((err) => {
      console.error("❌ SignalR Startup Error:", err);
      throw err;
    });

  return startPromise;
}
