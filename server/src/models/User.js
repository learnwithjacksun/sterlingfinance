import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null, select: false },
    pinHash: { type: String, default: null, select: false },

    phone: { type: String, default: "" },
    country: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    employmentStatus: { type: String, default: "" },

    accountType: { type: String, default: "" },
    accountNumber: { type: String, unique: true, sparse: true },
    currency: { type: String, default: "$" },
    balance: { type: Number, default: 0 },

    isActive: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },

    // Bumped on password change to invalidate every outstanding access token.
    tokenVersion: { type: Number, default: 0, select: false },
    failedLogins: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.passwordHash;
        delete ret.pinHash;
        delete ret.tokenVersion;
        delete ret.failedLogins;
        delete ret.lockUntil;
        return ret;
      },
    },
  },
);

userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});
userSchema.virtual("hasPin").get(function () {
  return Boolean(this.pinHash);
});

export const User = mongoose.model("User", userSchema);
