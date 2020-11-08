import { Usuario } from "../models/userModel";
import fileSystem from "fs";
import { Response } from "express";

export const subirImg = async (
  tipoImagen: string,
  id: string,
  nombreArchivo: string,
  res?: Response
) => {
  switch (tipoImagen) {
    case "usuario":
      try {
        const user = await Usuario.findById(id).exec();
        if (user) {
          const pathViejo = "./uploads/usuario/" + user.img; // pathViejo de la imagen si el usuario ya tiene una guardada
          if (fileSystem.existsSync(pathViejo)) {
            // si existe elimina la imagen anterior
            // console.log(fileSystem.existsSync(pathViejo))
            // console.log(pathViejo)
            fileSystem.unlinkSync(pathViejo)
            // fileSystem.unlink(pathViejo, (err) => {
            //   if (err) {
            //     return res?.status(500).json({
            //       ok: false,
            //       mensaje: "Error en path",
            //       errors: err,
            //     });
            //   }
            // });
          }

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
