import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import userRoutes from '../routes/user';
import imgs from '../routes/imgs';

// export const app =  express();

export default class Server {

    public app: express.Application;
    public port: number;

    constructor() {
        this.app = express();
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(cors({ origin: true, credentials: true }));
        this.port = Number(process.env.PORT) || 3500;
    }
        
    start(port: number, callback: any){
        this.app.listen(port, callback);
        this.startRoutes();
    }

    startRoutes() {
        this.app.use('/user', userRoutes )
        this.app.use('/img', imgs)
    }

}