import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dineops";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

interface GlobalMongoose {
    mongooseCache?: MongooseCache;
}

const cached: MongooseCache = (global as any).mongooseCache || { conn: null, promise: null };

if (!(global as any).mongooseCache) {
    (global as any).mongooseCache = cached;
}

async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
let voiceConn: mongoose.Connection | null = null;

export async function connectVoiceDB(): Promise<mongoose.Connection> {
    const mainMongoose = await connectDB();
    if (!voiceConn) {
        voiceConn = mainMongoose.connection.useDb("dineops_db", { useCache: true });
    }
    return voiceConn;
}

export default connectDB;
