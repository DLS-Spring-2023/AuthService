import { LoggingService } from "dls-messagelibrary";
export default new LoggingService("AuthService", process.env.SERVICE_BUS_URL!)
