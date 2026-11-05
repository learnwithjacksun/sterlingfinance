import mongoose from "mongoose";

const { Schema } = mongoose;

const toJSON = {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
};

// ID.me style identity submission.
const kycSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    firstName: String,
    lastName: String,
    dateOfBirth: String,
    email: String,
    phone: String,
    address: String,
    idType: { type: String, enum: ["drivers_license", "passport", "state_id"] },
    idNumber: String,
    frontIdImg: String,
    backIdImg: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true, toJSON },
);

const helocSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    propertyAddress: String,
    propertyType: String,
    estimatedValue: String,
    loanAmount: String,
    employmentStatus: String,
    annualIncome: String,
    creditScore: String,
    existingMortgage: String,
    mortgageBalance: String,
    purpose: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true, toJSON },
);

export const Kyc = mongoose.model("Kyc", kycSchema);
export const HelocApplication = mongoose.model("HelocApplication", helocSchema);
