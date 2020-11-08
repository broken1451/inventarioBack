import { Router, Request, Response } from "express";
import { Pc } from "../models/pcModel";
import validator from "validator";
import Token from "../utils/token";
import fileUpload from "express-fileupload";
import express from "express";
import uniqid from "uniqid";
import { verificaToken } from "../middlewares/auth";
import { subirImg } from '../utils/subirImg';

const pcRoutes = Router();

//middleware  hacia la ruta
const app = express();
app.use(fileUpload());

pcRoutes.get("/", async (req: any, res: Response) => {
  try {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    const pcs = await Pc.find({})
      .skip(desde)
      .limit(10)
      //   .populate("usuario", "-_id sin id name email")
      .populate("usuario", "name email")
      .exec();
    const pcNumbers = await Pc.countDocuments({});
    return res.json({
      ok: true,
      mensaje: "Todo funciona bien",
      pcs,
      pcNumbers,
      // user: req.usuario
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      mensaje: `Error en el servidor`,
    });
  }
});

pcRoutes.get("/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const pc = await Pc.findById(id).exec();
    return res.status(200).json({
      ok: true,
      mensaje: "Todo funciona bien",
      pc,
      // user: req.usuario
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: `No existe pc con este id ${id}`,
    });
  }
});

pcRoutes.post("/create", verificaToken, async (req: any, res: Response) => {
  const { name, type } = req.body;
  try {
    if (!validator.isEmpty(name)) {
      const pc = {
        name,
        type,
        usuario: req.usuario,
      };
      const pcs = await Pc.create(pc);
      return res.status(201).json({
        ok: true,
        mensaje: "Todo funciona bien",
        pcs,
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: "Los datos no son validos",
        error: {
          errors: {
            message: "Se debe ingresar al menos el nombre del pc.",
          },
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Faltan datos por enviar",
      error: {
        errors: {
          message: "Se debe ingresar al menos el nombre del pc.",
          error,
        },
      },
    });
  }
});

pcRoutes.put("/update/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const { name, type } = req.body;
    const pcUpdate: any = await Pc.findById(id).exec();
    if (pcUpdate) {
      if (!validator.isEmpty(name)) {
        pcUpdate.name = name || "";
        pcUpdate.type = type || "";
        const pcUpdateSave = await pcUpdate.save();
        return res.status(200).json({
          ok: true,
          mensaje: "Pc Actualizado exitosamente",
          pcUpdateSave,
        });
      } else {
        return res.status(400).json({
          ok: false,
          message: "Los datos no son validos",
          error: {
            errors: {
              message: "Se debe ingresar al menos el nombre del pc.",
            },
          },
        });
      }
    } else {
      return res.status(400).json({
        ok: true,
        mensaje: "El pc con el " + id + "no existe",
        errors: { message: "No existe un pc con ese ID" },
      });
    }
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: "El pc con el id " + id + " no existe",
      errors: { message: "No existe un pc con ese ID" },
      error,
    });
  }
});

pcRoutes.delete("/delete/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const pcDeleted: any = await Pc.findByIdAndRemove(id).exec();
    if (pcDeleted) {
      return res.status(200).json({
        ok: true,
        mensaje: "Pc eiminado exitosamente",
        pcDeleted,
      });
    } else {
      return res.status(400).json({
        ok: false,
        mensaje: "El pc con el " + id + " ya no existe",
        errors: { message: "No existe un pc con ese ID" },
      });
    }
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: "El pc con el id " + id + " no existe",
      errors: { message: "No existe un pc con ese ID" },
      error,
    });
  }
});



pcRoutes.put("/upload/:tipoImagen/:id", async (req: any, res: Response) => {
    const { id, tipoImagen} = req.params
    const files = req.files;
    try {
  
      // Tipos de coleccion
      const tipoImagenesValidos = ['pc'];
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
  


export default pcRoutes;
