import dotenv from "dotenv";
import Server from "./server/server";
import {db} from './db/db'
import fileUpload from "express-fileupload";
dotenv.config();


const server = new Server();
server.app.use(fileUpload({useTempFiles: true}));
const conn = async () => {
   try {
    await db()
    console.log("La conexion a la bd se ha realizado bien");
    server.start(3000, () => { 
        console.log(`Servidor corriendo exitosamente en el puerto ${process.env.PORT}`);
    });
   } catch (error) {
       console.log(error)
   }
}

conn();
