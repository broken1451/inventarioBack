import { Router, Request, Response } from "express";
import { Otros } from "../models/otrosModel";
import validator from "validator";
import Token from "../utils/token";
import fileUpload from "express-fileupload";
import express from "express";
import uniqid from "uniqid";
import { verificaToken } from "../middlewares/auth";
import { subirImg } from "../utils/subirImg";
import { Memorias } from "../models/memoriaModel";

const otrosRoutes = Router();

//middleware  hacia la ruta
const app = express();
app.use(fileUpload());

otrosRoutes.get("/", async (req: any, res: Response) => {
  try {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    const otros = await Otros.find({})
      .skip(desde)
      .limit(10)
      //   .populate("usuario", "-_id sin id name email")
      .populate("usuario", "name email")
      .exec();
    const otrossNumbers = await Otros.countDocuments({});
    return res.json({
      ok: true,
      mensaje: "Get all otros",
      otros,
      otrossNumbers,
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

otrosRoutes.get("/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const otros = await Otros.findById(id).exec();
    return res.status(200).json({
      ok: true,
      mensaje: "Get otro por id",
      otros,
      // user: req.usuario
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: `No existe Otros con este id ${id}`,
    });
  }
});

otrosRoutes.post("/create", verificaToken, async (req: any, res: Response) => {
  const { name, description } = req.body;
  try {
    if (!validator.isEmpty(name)) {
      const others = {
        name,
        description,
        usuario: req.usuario,
      };
      const otros = await Otros.create(others);
      return res.status(201).json({
        ok: true,
        mensaje: "otros funcionando",
        otros,
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: "Los datos no son validos",
        error: {
          errors: {
            message: "Se debe ingresar al menos el nombre del algun producto.",
          },
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Faltan datos por enviar",
      error: {
        errors: {
          message: "Se debe ingresar al menos el nombre del algun producto.",
          error,
        },
      },
    });
  }
});

otrosRoutes.put("/update/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const { name, description } = req.body;
    const otrosUpdate: any = await Otros.findById(id).exec();
    if (otrosUpdate) {
      if (!validator.isEmpty(name)) {
        otrosUpdate.name = name || "";
        otrosUpdate.description = description || "";
        const otrosUpdateSave = await otrosUpdate.save();
        return res.status(200).json({
          ok: true,
          mensaje: "Otros Actualizado exitosamente",
          otrosUpdateSave,
        });
      } else {
        return res.status(400).json({
          ok: false,
          message: "Los datos no son validos",
          error: {
            errors: {
              message:
                "Se debe ingresar al menos el nombre del algun producto.",
            },
          },
        });
      }
    } else {
      return res.status(400).json({
        ok: true,
        mensaje: "El producto con el id " + id + "no existe",
        errors: { message: "No existe una el producto con ese ID" },
      });
    }
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: "El producto con el id " + id + " no existe",
      errors: { message: "No existe un producto con ese ID" },
      error,
    });
  }
});

otrosRoutes.delete("/delete/:id", async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const otrosDeleted: any = await Otros.findByIdAndRemove(id).exec();
    if (otrosDeleted) {
      return res.status(200).json({
        ok: true,
        mensaje: "El producto eiminado exitosamente",
        otrosDeleted,
      });
    } else {
      return res.status(400).json({
        ok: false,
        mensaje: "El producto con el id " + id + " ya no existe",
        errors: { message: "No existe un producto con ese ID" },
      });
    }
  } catch (error) {
    return res.status(400).json({
      ok: false,
      mensaje: "El producto con el id " + id + " no existe",
      errors: { message: "No existe un producto con ese ID" },
      error,
    });
  }
});

otrosRoutes.put("/upload/:tipoImagen/:id", async (req: any, res: Response) => {
  const { id, tipoImagen } = req.params;
  const files = req.files;
  try {
    // Tipos de coleccion
    const tipoImagenesValidos = ["otros"];
    if (tipoImagenesValidos.indexOf(tipoImagen) < 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "Tipo de coleccion de imagen no valida",
        errors: { message: "Tipo de coleccion de imagen no valida" },
      });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "No selecciono ningun archivo",
        errors: { message: "Debe seleccionar una imagen" },
      });
    }

    const nombreArchivo = req.files.image; //imagen es el nombre que esta en el postman
    const nombreArchivoSeparado = nombreArchivo.name.split("."); // separar en un arreglo el archivo para tener su extension
    const extensionArchivo =
      nombreArchivoSeparado[nombreArchivoSeparado.length - 1]; // obtener la extension del archivo

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

    const idUnico = uniqid();
    const nombreImagenPersonalizado = `${idUnico}.${extensionArchivo}`;
    const path = `./uploads/${tipoImagen}/${nombreImagenPersonalizado}`;

    nombreArchivo.mv(path, (err: any) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al mover archivo",
          errors: err,
        });
      }
      subirImg(tipoImagen, id, nombreImagenPersonalizado, res);
      // return res.status(200).json({
      //   ok: true,
      //   mensaje: "Archivo movido",
      //   nombreImagenPersonalizado: nombreImagenPersonalizado
      // });
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});

export default otrosRoutes;
