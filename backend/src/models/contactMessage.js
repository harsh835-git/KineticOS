import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    // inside your schema:
isRead: { 
  type: Boolean, 
  default: false 
},
  },
  
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);