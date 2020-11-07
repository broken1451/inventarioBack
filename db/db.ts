import mongoose from 'mongoose';

export const db =  async () => {

    mongoose.set("useFindAndModify", false);
    mongoose.Promise = global.Promise;
    await mongoose.connect(String(process.env.URL_DB),  {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
}



