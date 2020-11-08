import { Usuario } from "../models/userModel";
import fileSystem from "fs";
import { Response } from "express";


const borrarImg = (path: any) => {
    if (fileSystem.existsSync(path)) {
        fileSystem.unlinkSync(path)
      }
}

export const subirImg = async (tipoImagen: string, id: string, nombreArchivo: string, res?: Response) => {

  let pathViejo = ''
  switch (tipoImagen) {
    case "usuario":
      try {
        const user = await Usuario.findById(id).exec();
        if (user) {
          pathViejo = "./uploads/usuario/" + user.img; // pathViejo de la imagen si el usuario ya tiene una guardada
          borrarImg(pathViejo)
          user.img = nombreArchivo;
          await user.save();
          user.password = ":)";
          return res?.json({
            ok: true,
            mensaje: "No es un user por id",
            user,
          });
        }
      } catch (error) {
        console.log({ error });
        return res?.json({
          ok: false,
          mensaje: "No es un user por id",
        });
      }

      break;

    default:
      console.log("default");
      break;
  }
};
