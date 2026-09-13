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
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("Report", reportSchema);