import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export const otrosSchema = new mongoose.Schema({
  name: { type: String, required: [true, "El nombre es necesario y unico"] },
  description: { type: String, required: [false, ''] },
  img: { type: String, default: "" },
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

interface Otros extends mongoose.Document {
  name: string;
  img?: string;
  usuario?: string;
}

export const Otros = mongoose.model<Otros>("otros", otrosSchema);
