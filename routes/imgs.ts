import { Router, Request, Response } from "express";
import { Imgs } from "../models/imgs";

import fileUpload from "express-fileupload";
import express from "express";
import uniqid from "uniqid";
import _ from "lodash";
import { crearImgs } from "../utils/subirImg";
import path from "path";
import fileSystem from "fs";

const imgs = Router();

//middleware  hacia la ruta
const app = express();
app.use(fileUpload());

imgs.post("/uploadImgs", async (req: Request, res: Response) => {
  try {
    if (!req.files) {
      return res.send({
        status: false,
        message: "No se pudo subir la imagen seeccionada",
      });
    }

    let data: any = [];
    if (!Array.isArray(req.files.image)) {
      let file = req.files.image;
      const nombreArchivoSeparado = file.name.split(".");
      const extensionArchivo =
        nombreArchivoSeparado[nombreArchivoSeparado.length - 1];
      const extensionesValida = ["png", "jpg", "gif", "jpeg"];
      if (!extensionesValida.includes(extensionArchivo)) {
        // Si manda un -1 o cualquier otro valor menor a cero manda error
        return res.status(400).json({
          ok: false,
          mensaje: "Extension no valida",
          errors: {
            message:
              "La extesion agregada no es permitida solo se admiten estas extensiones: " +
              extensionesValida.join(","),
          },
        });
      }

      if (!extensionesValida.includes(extensionArchivo)) {
        throw new Error("error");
      } else {
        file.mv("./uploads/imgs/" + file.name);
        crearImgs(file.name, res);
      }
    } else {
      try {
        _.forEach(_.keysIn(req.files.image), (key) => {
          let file = req.files.image[key];
          const nombreArchivoSeparado = file.name.split(".");
          const extensionArchivo =
            nombreArchivoSeparado[nombreArchivoSeparado.length - 1];
          const extensionesValida = ["png", "jpg", "gif", "jpeg"];
          if (!extensionesValida.includes(extensionArchivo)) {
            console.log("if extension no valida");
            return new Error("error");
          } else {
            console.log("else extension no valida primero aca ");
            file.mv("./uploads/imgs/" + file.name);
            data.push({
              name: file.name,
              mimetype: file.mimetype,
              size: file.size,
            });
          }
        });
        crearImgs(data, res);
      } catch (error) {
        const extensionesValida = ["png", "jpg", "gif", "jpeg"];
        // console.log('Error catch ====> ', error)
        return res.status(400).json({
          ok: false,
          mensaje: "Solo se subiran Imagenes con extensiones validas",
          errors: {
            message:
              "Un archivo que agrego tiene una extesion no valida solo se admiten estas extensiones: " +
              extensionesValida.join(","),
          },
        });
      }

      return new Error("error");
    }
  } catch (error) {
    const extensionesValida = ["png", "jpg", "gif", "jpeg"];
    return res.status(400).json({
      ok: false,
      mensaje: "Solo se subiran Imagenes con extensiones validas",
      errors: {
        message:
          "Un archivo que agrego tiene una extesion no valida solo se admiten estas extensiones: " +
          extensionesValida.join(","),
      },
    });
  }
});

imgs.get("/:tipoImagen/:imagen", (req, res, next) => {
  const { tipoImagen, imagen } = req.params;
  try {
    // console.log("tipoImagen: ", tipoImagen);
    // console.log("imagen: ", imagen); 

    // Creacion del path  __dirname(toda la ruta donde se encuentra en este momento), `referencia a donde se encuentra la imagen`
    const pathImagen = path.resolve(__dirname, `../../uploads/${tipoImagen}/${imagen}`); // Resolver el path para que siempre quede correcto, tipoImagen = usuarios / estudiantes, imagen = nombre de imagen
    if (fileSystem.existsSync(pathImagen)) {
      return res.sendFile(pathImagen);
    } else {
      const pathNoImage = path.resolve(__dirname, `../../assets/no-img.jpg`);
      return res.sendFile(pathNoImage);
    }

  } catch (error) {} 
});

export default imgs;
