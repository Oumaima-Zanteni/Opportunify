import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const LOCAL_DB_PATH = path.resolve(process.cwd(), ".mongo-data");

export const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI n'est pas défini dans .env");
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connecté : ${conn.connection.host}/${conn.connection.name}`);
    return;
  } catch (err) {
    if (process.env.NODE_ENV === "production" || !err.message?.includes("ECONNREFUSED")) {
      console.error(`❌ Erreur connexion MongoDB : ${err.message}`);
      process.exit(1);
    }

    console.warn("⚠️ MongoDB local indisponible, démarrage d'une base locale de secours...");
    fs.mkdirSync(LOCAL_DB_PATH, { recursive: true });
    const mongod = await MongoMemoryServer.create({
      instance: {
        dbName: "opportunify",
        dbPath: LOCAL_DB_PATH,
        storageEngine: "wiredTiger",
      },
    });
    uri = mongod.getUri("opportunify");
    const conn = await mongoose.connect(uri);
    console.log(`✅ Base locale prête : ${conn.connection.name} (données conservées dans .mongo-data)`);
  }
};
