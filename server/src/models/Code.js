import mongoose from "mongoose";

const { Schema } = mongoose;

// One verification-code record per user.
const codeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    codeName: { type: String, default: "" },
    codeNumber: { type: String, default: "" },
    instruction: { type: String, default: "" },
    message: { type: String, default: "" },
    status: { type: String, enum: ["successful", "declined", ""], default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

export const Code = mongoose.model("Code", codeSchema);
