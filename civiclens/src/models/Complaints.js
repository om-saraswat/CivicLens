import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
  deptName: { type: String, required: true },
  deptMail: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  complaintNo: { type: String, required: true, unique: true },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  coordinates: {
    lat: { type: String },
    lon: { type: String }
  },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Create compound index for better query performance
ComplaintSchema.index({ user: 1, complaintNo: 1 });
ComplaintSchema.index({ deptName: 1, createdAt: -1 });

export default mongoose.models.Complaint || mongoose.model("Complaint", ComplaintSchema);