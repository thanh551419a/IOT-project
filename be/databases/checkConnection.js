import mongoose from "mongoose";

export function checkMongoConnection() {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 0:
      console.log("🔴 MongoDB: Disconnected");
      return "disconnected";
    case 1:
      console.log("🟢 MongoDB: Connected");
      return "connected";
    case 2:
      console.log("🟡 MongoDB: Connecting...");
      return "connecting";
    case 3:
      console.log("🟠 MongoDB: Disconnecting...");
      return "disconnecting";
    default:
      console.log("⚪ MongoDB: Unknown state");q
      return "unknown";
  }
}
