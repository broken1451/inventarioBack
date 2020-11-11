import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export const memoriaSchema = new mongoose.Schema({
  name: { type: String, required: [true, "El nombre es necesario y unico"] },
  img: { type: String, default: "" },
  type: { type: String, default: "" },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: [
      true,
      "Debe de existir una referencia al users, campo obligatorio",
    ],
  },
  created: { type: Date, default: Date.now },
});

interface Memoria extends mongoose.Document {
  name: string;
  img?: string;
  type: string;
  usuario?: string;
}

export const Memorias = mongoose.model<Memoria>("memorias", memoriaSchema);
