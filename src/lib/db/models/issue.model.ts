import mongoose, { Schema, Document } from "mongoose";

export interface IIssue extends Document {
  title: string;
  description: string;
  category: "Roads & Infrastructure" | "Sanitation & Waste" | "Water & Sewage" | "Electrical & Lighting" | "Public Safety" | "Other";
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "Verified" | "In Progress" | "Resolved" | "Rejected" | "Verification Failed" | "Closed";
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  imageUrl: string;
  department: string; // The assigned authority department based on category
  reportedBy: mongoose.Types.ObjectId; // Reference to User
  assignedTo?: mongoose.Types.ObjectId; // Reference to Authority User
  resolvedImageUrl?: string; // Proof image uploaded by authority
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  citizenRating?: number; // 1-5 star rating
  citizenFeedback?: string; // Optional feedback comment
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  aiAnalysis: {
    isCivicIssue: boolean;
    confidenceScore: number;
    reasoning: string;
    resolutionVerification?: {
      isFixed: boolean;
      confidenceScore: number;
      reasoning: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ["Roads & Infrastructure", "Sanitation & Waste", "Water & Sewage", "Electrical & Lighting", "Public Safety", "Other"]
    },
    severity: { 
      type: String, 
      required: true,
      enum: ["Low", "Medium", "High", "Critical"]
    },
    status: { 
      type: String, 
      required: true, 
      default: "Pending",
      enum: ["Pending", "Verified", "In Progress", "Resolved", "Rejected", "Verification Failed", "Closed"]
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: { type: String, required: true },
    imageUrl: { type: String, required: true },
    department: { type: String, required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedImageUrl: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
    citizenRating: { type: Number },
    citizenFeedback: { type: String },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    aiAnalysis: {
      isCivicIssue: { type: Boolean, required: true },
      confidenceScore: { type: Number, required: true },
      reasoning: { type: String, required: true },
      resolutionVerification: {
        isFixed: { type: Boolean },
        confidenceScore: { type: Number },
        reasoning: { type: String }
      }
    }
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
  delete (mongoose.models as any).Issue;
}

const Issue = mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);
export default Issue;
