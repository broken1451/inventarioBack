import { Router, Request, Response } from "express";
import { Usuario } from '../models/userModel';
import bcrypt from "bcrypt";
import validator from 'validator'
import Token from '../utils/token';
import fileUpload from "express-fileupload";
import express from 'express';
import uniqid from "uniqid";
import { subirImg } from "../utils/subirImg";
import { verificaToken } from "../middlewares/auth";



const userRoutes = Router();

//middleware  hacia la ruta
const app = express();
app.use(fileUpload());

userRoutes.get("/", verificaToken ,async (req: any, res: Response) => {
  try {
    let desde = req.query.desde || 0;
    desde =  Number(desde);
    const users = await Usuario.find({}, 'name email img _id created').skip(desde).limit(5).exec();
    const usersNumbers = await Usuario.countDocuments({});
    return res.status(200).json({
      ok: true,
      mensaje: "Todo funciona bien",
      users,
      usersNumbers,
      // user: req.usuario
    });
  } catch (error) {
    console.log(error)
  }
});

userRoutes.post("/create",verificaToken ,async (req: Request, res: Response) => {
  try {
    
    const { name, email, password} = req.body
    if (!validator.isEmpty(name) && !validator.isEmpty(email) && !validator.isEmpty(password) ) {
      const user = {
         name,
         email,
         password: bcrypt.hashSync(password, 10),
      };
      const userCreated = await Usuario.create(user)
      return res.status(201).json({
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
    return res.status(500).json({
        message: "Faltan datos por enviar",
    });
  }
});

userRoutes.put("/update/:id",verificaToken ,async (req: any, res: Response) => {
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


userRoutes.delete("/delete/:id", verificaToken ,async(req: any, res: Response) => {
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

userRoutes.put("/upload/:tipoImagen/:id",verificaToken ,async (req: any, res: Response) => {
  const { id, tipoImagen} = req.params
  const files = req.files;
  try {

    // Tipos de coleccion
    const tipoImagenesValidos = ['usuario', 'pc', 'memoria', 'otros'];
    if (tipoImagenesValidos.indexOf(tipoImagen) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de coleccion de imagen no valida",
            errors: {message: "Tipo de coleccion de imagen no valida"}
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "No selecciono ningun archivo",
        errors: { message: 'Debe seleccionar una imagen' }
      });
    }

    const nombreArchivo = req.files.image; //imagen es el nombre que esta en el postman
    const nombreArchivoSeparado = nombreArchivo.name.split('.'); // separar en un arreglo el archivo para tener su extension
    const extensionArchivo = nombreArchivoSeparado[nombreArchivoSeparado.length - 1]; // obtener la extension del archivo
  
    const extensionesValida = ['png', 'jpg', 'gif', 'jpeg'];
    if (!extensionesValida.includes(extensionArchivo)) {
      // Si manda un -1 o cualquier otro valor menor a cero manda error
      return res.status(400).json({
        ok: false,
        mensaje: 'Extension no valida',
        errors: {
          message:
            'La extesion agregada no es permitida solo se admiten estas extensiones: ' +
            extensionesValida.join(','),
        },
      });
    }

    const idUnico = uniqid();
    const nombreImagenPersonalizado = `${idUnico}.${extensionArchivo}`;
    const path = `./uploads/${tipoImagen}/${nombreImagenPersonalizado}`;

    nombreArchivo.mv(path, (err: any) => {
      if (err) {
        return res.status(500).json({
            ok: false,
            mensaje: "Error al mover archivo",
            errors: err
        });
      }
      subirImg(tipoImagen, id, nombreImagenPersonalizado, res)
      // return res.status(200).json({
      //   ok: true,
      //   mensaje: "Archivo movido",
      //   nombreImagenPersonalizado: nombreImagenPersonalizado
      // });
    });

 
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error
   });
  }
});




// Login
userRoutes.post("/login", async (req: Request, res: Response) => {
  const { email, password} = req.body
  try {
    
    const userLogin = await Usuario.findOne({email: email}).exec();
    if (userLogin) {
      if (userLogin.compararClave(password)) {
        const payload = {
          _id: userLogin._id,
          name: userLogin.name,
          email: userLogin.email,
          img: userLogin.img,
        };
        console.log({payload})
        const token = Token.getJwtToken(userLogin);
        return res.status(200).json({
          ok: true,
          userLogin,
          token,
        });
      } else if (password == '' || userLogin.password == ''){
        return res.status(400).json({
          ok: false,
          mensaje: 'Campo vacio',
          // errors: {message:'Error no se encuentra email: ' + body.email +  ' asociado'}
          errors: { message: 'El campo no puede estar vacio' },
        });
      } else if (password !== userLogin.password) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Clave incorrecta',
          errors: { message: 'Clave incorrecta' },
        });
      } 
    } else {
       throw new Error()
    }
  } catch (error) {

    return res.status(400).json({
      ok: false,
      mensaje: 'Credenciales incorrectas',
      errors: { message: 'Error no coincide El usuario registrado en la base de datos' },
    });
  }
});

export default userRoutes;
