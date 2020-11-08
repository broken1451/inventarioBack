import mongoose from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import { Schema } from 'mongoose';

const pcSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'El nombre es necesario y unico'] },
    img: { type: String, default: '' },
    type: {type: String , default: ''},
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [
        true,
        "Debe de existir una referencia al users, campo obligatorio",
      ],
    },
    created: { type: Date, default: Date.now}
  });



interface Pc extends mongoose.Document {
  name: string;
  img?: string;
  type: string;
  usuario?: string   
}

// pcSchema.plugin(uniqueValidator,{message:'{PATH} debe ser unico'} );
export const Pc = mongoose.model<Pc>("pcs", pcSchema);