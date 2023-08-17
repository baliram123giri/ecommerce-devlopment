const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    subCategory: [{type:mongoose.Schema.Types.ObjectId, ref:"subCategory"}]
    
}, { timestamps: true });


const Category = mongoose.model('Category', categorySchema);
const SubCategory = mongoose.model('subCategory', subCategorySchema);

module.exports = { Category, SubCategory };