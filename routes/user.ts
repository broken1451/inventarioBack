import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";

const userRoutes = Router();

userRoutes.get("/", (req: Request, res: Response) => {
    return res.json({
      ok: true,
      mensaje: "Todo funciona bien",
    });
});


export default userRoutes;
