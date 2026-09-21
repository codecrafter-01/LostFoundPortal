const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
{
  itemName: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    default: "",
  },

  reportType: {
    type: String,
    enum: ["lost", "found"],
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // New fields for Returned feature

  status: {
    type: String,
    enum: ["active", "returned"],
    default: "active",
  },

  returnedAt: {
    type: Date,
    default: null,
  },

  // Proof of Ownership & Claim Verification
  verificationQuestion: {
    type: String,
    default: "",
  },

  // Autonomous College Campus Custody
  custodyType: {
    type: String,
    enum: ["with_reporter", "college_desk"],
    default: "with_reporter",
  },

  custodyLocation: {
    type: String,
    default: "",
  },

  claims: [
    {
      claimant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      claimantName: {
        type: String,
        required: true,
      },
      claimantEmail: {
        type: String,
        required: true,
      },
      proofAnswer: {
        type: String,
        required: true,
      },
      contactPhone: {
        type: String,
        default: "",
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
    },
  ],
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("Report", reportSchema);