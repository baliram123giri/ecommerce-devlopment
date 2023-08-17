const { TagsModel } = require("../../model/tags.model")
const { paramsIdSchema } = require("../Category/validation")
const { addtagsSchema, idParams, deleteSelectdSchema } = require("./validation")

async function addTag(req, res) {
    try {
        await addtagsSchema.validateAsync(req.body)
        const checkExist = await TagsModel.findOne({ name: req.body.name, subcategory: req.body.subcategory, category: req.body.subcategory })
        if (checkExist) return res.status(400).json("Tag already added!!")
        await TagsModel.create(req.body)
        res.json("category added successfully")
    } catch (error) {
        res.status(400).json(error.message)
    }
}

async function getTags(req, res) {
    try {
        const { start, size, filters, sortings, search } = req.query
        const pageNo = Number(start) || 0
        const limit = Number(size) || 25

        //if we have filters
        let filtersData = {}

        if (filters) {
            for (const key of JSON.parse(filters)) {
                filtersData[key.id] = { $regex: new RegExp(key.value, 'i') }
            }
        }
        //if we have sorting
        let sorting = { name: 1 }
        if (sortings) {
            for (const key of JSON.parse(sortings)) {
                sorting = { [key.id]: key.value ? 1 : -1 }
            }
        }

        //search query
        let searchQuery = []

        if (search) {
            searchQuery = [{ "subcategory.name": { $regex: new RegExp(search, "i") } }, { name: { $regex: new RegExp(search, "i") } }]
        }
        const tags = await TagsModel.aggregate([{
            $lookup: {
                from: "subcategories",
                foreignField: "_id",
                localField: "subcategory",
                as: "subcategory"
            },

        }, { $unwind: "$subcategory" }, {
            $project: {
                name: 1,
                _id: 1,
                category:1,
                "subcategory": "$subcategory"
            }
        }, {
            $match: {
                $or: search ? searchQuery : [filtersData],
            }
        }, { $sort: sorting }, { $skip: pageNo }, { $limit: limit }])

        const totalRowCount
            = await TagsModel.countDocuments({
                $or: search ? searchQuery : [filtersData]
            })

        res.json({
            data: tags, meta: { totalRowCount }
        })
    } catch (error) {
        res.status(400).json(error.message)
    }
}

async function getTagsByCategory(req, res) {
    try {
        await paramsIdSchema.validateAsync({ id: req.params.id })
        const tags = await TagsModel.find({ subcategory: req.params.id }, { name: 1 })
        res.json(tags)
    } catch (error) {
        res.status(400).json(error.message)
    }
}

async function deletetags(req, res) {
    try {
        await idParams.validateAsync({ id: req.params.id })
        await TagsModel.findByIdAndDelete(req.params.id)
        res.status(200).json("deleted successfully")
    } catch (error) {
        res.status(400).json(error.message)
    }
}
async function deleteSelectedtags(req, res) {
    try {
        await deleteSelectdSchema.validateAsync(req.body)
        await TagsModel.deleteMany({ _id: { $in: req.body } })
        res.status(200).json("deleted successfully")
    } catch (error) {
        res.status(400).json(error.message)
    }
}

async function updateTags(req, res) {
    try {
        await idParams.validateAsync({ id: req.params.id })
        await addtagsSchema.validateAsync(req.body)
        await TagsModel.findByIdAndUpdate(req.params.id, req.body)
        res.status(200).json("Tags Updated Successfully")
    } catch (error) {
        res.status(400).json(error.message)
    }
}
module.exports = { addTag, getTags, deletetags, deleteSelectedtags, updateTags, getTagsByCategory }