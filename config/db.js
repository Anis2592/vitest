import mongoose from 'mongoose';


const mongoURI = "mongodb+srv://irshad:irshadsheikh@cluster1.d60cj.mongodb.net/cluster1?retryWrites=true&w=majority";

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Connection error:", error);
    process.exit(1);
  }
};
