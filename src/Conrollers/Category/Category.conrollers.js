const Joi = require("joi");
const {
    categoryValidationSchema,
    paramsSchema,
    updateSchemaValidation,
    paramsIdSchema,
    deleteMultiCategoriesSchema,
} = require("./validation");
const { Category, SubCategory } = require("../../model/category.model");

async function createCategory(req, res) {
    try {
        const { error } = categoryValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { name, subCategory } = req.body;

        const savedSubCategory = await SubCategory.insertMany(subCategory);
        await Category.create({
            name,
            subCategory: savedSubCategory.map(({ _id }) => _id),
        });

        res.json("Category added successfully...");
    } catch (err) {
        res.status(400).json(err.message);
    }
}

// API route for getting all category records with pagination
async function getAllCategories(req, res) {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategories",
                },
            },
            { $unwind: "$subCategories" },
            {
                $project: {
                    _id: 1,
                    id: "$subCategories._id",
                    name: 1,
                    subCategoryName: "$subCategories.name",
                },
            },
        ]);

        res.json(categories);
    } catch (err) {
        res.status(400).json(err.message);
    }
}

// Delete a category by ID
async function deleteCategory(req, res) {
    try {
        const { id } = await paramsIdSchema.validateAsync({ id: req.params.id });
        const category = await SubCategory.findById({ _id: id });
        if (!category) {
            res.status(400).json({ message: "Category not found" });
        }
        await Category.updateMany(
            { subCategory: id },
            { $pull: { subCategory: id } }
        );
        await SubCategory.deleteOne({ _id: id }, { new: true });
        await Category.deleteMany({ subCategory: [] });

        res.json("Deleted successfully");
    } catch (err) {
        res.status(400).json(err.message);
    }
}

//delete multiple queries
async function deleteMultiCategories(req, res) {
    try {
        const data = await deleteMultiCategoriesSchema.validateAsync(req.body);
        await SubCategory.deleteMany({ _id: { $in: data } });
        await Category.updateMany(
            { subCategory: { $in: data } },
            { $pull: { subCategory: { $in: data } } }
        );
        await Category.deleteMany({ subCategory: [] });
        res.json("Deleted Successfully");
    } catch (error) {
        res.status(400).json(error.message);
    }
}
//add more subcategory
async function addMoreSubCategory(req, res) {
    try {
        const { id } = await paramsIdSchema.validateAsync({ id: req.params.id });

        const record = await Category.findOne({ _id: id });
        if (!record) {
            res.status(404).json("Category not found!!");
        }
        // //if id is avail and record found
        const data = await categoryValidationSchema.validateAsync(req.body);

        const subcategoryResult = await SubCategory.insertMany(data.subCategory);
        await Category.findByIdAndUpdate(id, {
            $push: { subCategory: subcategoryResult },
        });
        res.json("Category added successfully");
    } catch (error) {
        res.status(400).json(err.message);
    }
}

//get only categories list
async function getOnlyCategories(req, res) {
    try {
        const categories = await Category.aggregate([{ $unset: ["subCategory"] }])

        if (!categories.length) return res.status(404).json("Category list not found!!");
        res.json(categories);
    } catch (error) {
        res.status(400).json(error.message);
    }
}

//base on categories id get Subcategories
async function getOnlySubcategories(req, res) {
    try {

        const id = paramsIdSchema.validateAsync({ id: req.params.id })
        const subCategories = await Category.findById(req.params.id, "-_id subCategory").populate("subCategory", "name")
        res.json(subCategories.subCategory.map((ele) => ele))
    } catch (error) {
        res.status(400).json(error.message)
    }
}
//update
async function updateCategory(req, res) {
    try {
        const { id, categoryId } = await paramsSchema.validateAsync({
            id: req.params.id,
            categoryId: req.params.categoryId,
        });
        const { name, subCategory } = await updateSchemaValidation.validateAsync(
            req.body
        );
        await SubCategory.findByIdAndUpdate(id, { name: subCategory[0].name });
        await Category.findByIdAndUpdate(categoryId, { name: name });

        res.json("Updated successfully");
    } catch (error) {
        res.status(400).json(error.message);
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    deleteCategory,
    updateCategory,
    addMoreSubCategory,
    deleteMultiCategories,
    getOnlyCategories,
    getOnlySubcategories
};
