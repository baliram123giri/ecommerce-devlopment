
const mongoose = require("mongoose")
const TagsSchemaObj = {
    name: {
        type: String,
        unique: true,
        required: true
    },
    category: { type: String },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "subCategory" }
}
const TagsSchema = new mongoose.Schema(TagsSchemaObj, { timestamps: true })

const TagsModel = mongoose.model("Tag", TagsSchema)
module.exports = { TagsModel, TagsSchemaObj }