import mongoose from "mongoose";

const imgsSchema = new mongoose.Schema({ 
    // imgs: [{
    //   type: String
    // }],
    imgs: {
      type: Array 
  },
    created: { type: Date, default: Date.now}
});


interface Imgs extends mongoose.Document {
  img?: string;
}

export const Imgs = mongoose.model<any>("imgs", imgsSchema);