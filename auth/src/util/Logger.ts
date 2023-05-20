import { LoggingService } from "dls-messagelibrary";

export default new LoggingService("AuthService", process.env.SERVICE_BUS_URL!);

// class Logger extends LoggingService {
//     constructor() {
//         super("AuthService", process.env.SERVICE_BUS_URL!)
//     }
    
//     logDebug = async (message: string, body: object): Promise<void> => {
//         try{
//             await super.logDebug(message, body)
//         } catch (err){
//             console.error(err)
//         }
//     }

//     logError = async (message: string, body: object): Promise<void> => {
//         try{
//             await super.logError(message, body)
//         } catch (err){
//             console.error(err)
//         }
//     }

//     logInfo = async (message: string, body: object): Promise<void> => {
//         try{
//             await super.logInfo(message, body)
//         } catch (err){
//             console.error(err)
//         }
//     }

//     logWarning = async (message: string, body: object): Promise<void> => {
//         try{
//             await super.logWarning(message, body)
//         } catch (err){
//             console.error(err)
//         }
//     }
// }

// export default new Logger();
