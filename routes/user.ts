import { Router, Request, Response } from "express";
import { Usuario } from '../models/userModel';
import bcrypt from "bcrypt";
import validator from 'validator'

const userRoutes = Router();

// userRoutes.get("/", (req: Request, res: Response) => {
//     return res.json({
//       ok: true,
//       mensaje: "Todo funciona bien",
//     });
// });


userRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const users = await Usuario.find({}, 'name email img _id created').limit(10).exec();
    const usersNumbers = await Usuario.countDocuments({});
    return res.json({
      ok: true,
      mensaje: "Todo funciona bien",
      users,
      usersNumbers
    });
  } catch (error) {
    console.log(error)
  }
});

userRoutes.post("/create", async (req: Request, res: Response) => {
  try {
    
    const { name, email, password} = req.body
    if (!validator.isEmpty(name) && !validator.isEmpty(email) && !validator.isEmpty(password) ) {
      const user = {
         name,
         email,
         password: bcrypt.hashSync(password, 10),
      };
      const userCreated = await Usuario.create(user)
      return res.status(400).json({
        ok: true,
        message: "user guardado",
        userCreated
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: "Los datos no son validos",
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(400).json({
        message: "Faltan datos por enviar",
    });
  }
});

userRoutes.put("/update/:id", async (req: any, res: Response) => {
  const { id } = req.params
  try {
    const { name, email} = req.body
    const userUpdate: any = await Usuario.findById(id).exec();
    if (userUpdate) {
      userUpdate.name = name || '';
      userUpdate.email = email || '';
      const userUpdateSave = await userUpdate.save() 
      userUpdateSave.password = ":)";
      return res.status(200).json({
         ok: true,
         mensaje: "Todo funciona bien en put",
         userUpdateSave,
      });
    } else {
      return res.status(400).json({
        ok: true,
        mensaje: "El usuario con el " + id + "no existe",
        errors: { message: "No existe un usuario con ese ID" },
     });
    }
  
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: "El usuario con el "  + id + " no existe",
      errors: { message: "No existe un usuario con ese ID" },
      error
   });
  }
});


userRoutes.delete("/delete/:id", async(req: any, res: Response) => {
  const { id } = req.params
  try {
    const userDeleted: any = await Usuario.findByIdAndRemove(id).exec();
    if (userDeleted) {
      return res.status(200).json({
        ok: true,
        mensaje: "Funciona",
        userDeleted
     });
    } else {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario con el "  + id + " ya no existe",
        errors: { message: "No existe un usuario con ese ID" },
     });
    }
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: "El usuario con el id "  + id + " no existe",
      errors: { message: "No existe un usuario con ese ID" },
      error
   });
  }
})

export default userRoutes;
