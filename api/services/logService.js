import Log from "../models/Log.js";

class LogService {
  static async createLog(payload) {
    try {
      await Log.create(payload);
    } catch (error) {
      // Logging failures should never break primary request handling.
      console.error("Failed to create log entry:", error.message);
    }
  }
}

export default LogService;
