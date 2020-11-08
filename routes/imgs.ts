import { Router, Request, Response } from "express";
import { Imgs } from '../models/imgs';

import fileUpload from "express-fileupload";
import express from 'express';
import uniqid from "uniqid";
import _ from 'lodash';
import { crearImgs } from '../utils/subirImg';


const imgs = Router();

//middleware  hacia la ruta
const app = express();
app.use(fileUpload());


imgs.post("/uploadImgs", async (req: Request, res: Response) => {
  try {
    if(!req.files){
      return res.send({
          status: false,
          message: 'No se pudo subir la imagen seeccionada'
      })
    } 

    let data: any = []
    if(!Array.isArray(req.files.image)){
      let file = req.files.image
      const nombreArchivoSeparado = file.name.split('.');
      const extensionArchivo = nombreArchivoSeparado[nombreArchivoSeparado.length - 1];
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

      if (!extensionesValida.includes(extensionArchivo)) {
        throw new Error('error')
      } else {
        file.mv('./uploads/imgs/' + file.name)
        crearImgs(file.name, res); 
        // return res.send({
        //     status: true,
        //     message: 'File are Upload',
        //     name: file.name,
        //     mimetype: file.mimetype,
        //     size: file.size
        // })
      }



    } else {
      try {

        _.forEach(_.keysIn(req.files.image), (key) =>{
          let file = req.files.image[key];
          const nombreArchivoSeparado = file.name.split('.');
          const extensionArchivo = nombreArchivoSeparado[nombreArchivoSeparado.length - 1];
          const extensionesValida = ['png', 'jpg', 'gif', 'jpeg'];
          if (!extensionesValida.includes(extensionArchivo)) {
            throw new Error('error')
          } else {
            file.mv('./uploads/imgs/' + file.name);
            data.push({
              name: file.name,
              mimetype: file.mimetype,
              size: file.size 
            })
          }
        });
        crearImgs(data, res);         
      } catch (error) {
        const extensionesValida = ['png', 'jpg', 'gif', 'jpeg'];
        return res.status(400).json({
          ok: false,
          mensaje: 'Solo se subiran Imagenes con extensiones validas',
          errors: {
            message:
              'Un archivo que agrego tiene una extesion no valida solo se admiten estas extensiones: ' +
              extensionesValida.join(','),
          }, 
        });
      }
    }

  } catch (error) {
    console.log(error);
    return res.status(400).json({
        message: "Faltan datos por enviar",
    });
  }
});



export default imgs;
