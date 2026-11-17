import { connect } from 'mongoose';

export async function startDB(){
    console.log("Connect database")
    await connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/FilmFinder');
    console.log("connected db");
}
