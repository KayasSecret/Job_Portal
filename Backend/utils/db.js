import mongoose from 'mongoose';

const connectDB = async () => {
    let uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI environment variable is missing in .env");
    }

    // Strip accidental duplicate variable name prefix if copied into .env
    if (uri.startsWith("MONGO_URI=")) {
        uri = uri.replace(/^MONGO_URI=\s*/, "");
    }

    // Clean placeholder angle brackets if accidentally retained when copying from Atlas UI
    if (uri.includes("<") || uri.includes(">")) {
        console.warn("⚠️ Warning: Detected placeholder angle brackets ('<' or '>') in MONGO_URI. Sanitizing password brackets...");
        uri = uri.replace(/<([^>]+)>/g, "$1");
    }

    try {
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
        console.log(`✅ MongoDB connected successfully to database "${conn.connection.name}" on host "${conn.connection.host}"`);
    } catch(error) {
        console.error('❌ Database connection error:', error.message || error);
        throw error;
    }
}

export default connectDB;