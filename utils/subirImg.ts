import { Usuario } from "../models/userModel";
import { Pc } from "../models/pcModel";
import fileSystem from "fs";
import { Response } from "express";
import { Imgs } from '../models/imgs';
import { isValidObjectId } from "mongoose";



const borrarImg = (path: any) => {
    if (fileSystem.existsSync(path)) {
        fileSystem.unlinkSync(path)
      }
}

export const subirImg = async (tipoImagen: string, id: string, nombreArchivo: string, res?: Response) => {

  try {
    let pathViejo = ''
    switch (tipoImagen) {
      case "usuario":
        try {
          const user = await Usuario.findById(id).exec();
          if (user) {
              if (!pathViejo && user.img == '') {
              pathViejo = "../uploads/usuario/" + user.img;
              borrarImg(pathViejo)
              user.img = nombreArchivo;
              await user.save();
              user.password = ":)";
              return res?.status(200).json({
                ok: true,
                mensaje: "user actualizado con exito",
                user,
              });
            }else {
              pathViejo = "./uploads/usuario/" + user.img;  // pathViejo de la imagen si el usuario ya tiene una guardada
              borrarImg(pathViejo)
              user.img = nombreArchivo;
              await user.save();
              user.password = ":)";
              return res?.status(200).json({
                ok: true,
                mensaje: "user actualizado con exito",
                user,
              });
            }
          }
        } catch (error) {
          console.log({ error });
          return res?.json({
            ok: false,
            mensaje: "No existe un usuario por ese id",
          });
        }
        break;
        case "pc":
          try {
            const pc = await Pc.findById(id).exec();
            if (pc) {
                if (!pathViejo && pc.img == '') {
                pathViejo = "../uploads/pc/" + pc.img;
                borrarImg(pathViejo)
                pc.img = nombreArchivo;
                await pc.save();
                return res?.status(200).json({
                  ok: true,
                  mensaje: "Pc actualizado con exito",
                  pc,
                });
              }else {
                pathViejo = "./uploads/pc/" + pc.img;  // pathViejo de la imagen si el usuario ya tiene una guardada
                borrarImg(pathViejo)
                pc.img = nombreArchivo;
                await pc.save();
                return res?.status(200).json({
                  ok: true,
                  mensaje: "Pc actualizado con exito",
                  pc,
                });
              }
            }
          } catch (error) {
            // console.log({ error });
            return res?.json({
              ok: false,
              mensaje: `No existe un pc con id ${id}`,
            });
          }
        break;
      default:
        console.log("default");
        break;
  }
  } catch (error) {
    console.log(error)
  }
};


export const crearImgs = async (data: any, res?: Response  ) => {
  try {
    
    // const ImgsCreated  = Imgs.create({imgs: data}).then((data)=>{
    //   console.log({data})
    // })  
    const ImgsCreated  = await Imgs.create({imgs: data})  
      return res?.json({
         ok: true,
         mensaje: "Imagenes guardadas exitosamente",
         ImgsCreated,
      });

  } catch (error) {
    console.log('Error catch ====> ', error)
    throw new Error(`error ====> ${error}`);
  }
}; 
