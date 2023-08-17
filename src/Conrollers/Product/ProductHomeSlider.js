const { default: mongoose } = require("mongoose");
const fs = require("fs")
const { errorMessage } = require("../../utils/helpers.utils");
const { addProductSliderSchema, paramsId } = require("./validation");
const {
    ProductHomeSliderSchemaModel, ProductHomeSliderImageModel,
} = require("../../model/productSlider.model");
const { deleteFullImagePath } = require("../../utils/helpers.utils");

async function addProductSlider(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await addProductSliderSchema.validateAsync(req.body);
        const findProductSliderData = await ProductHomeSliderSchemaModel.findOne({
            category: req.body.category,
            subCategory: req.body.subCategory,
        }).session(session);

        if (findProductSliderData) {
            return res.status(500).json("Product already added!!")
        }

        //if not added 
        const addImage = await ProductHomeSliderImageModel.insertMany({ filename: req.file.filename, pathname: `http://${req.headers.host}/${req.file.path}` }, { session })
        await ProductHomeSliderSchemaModel.insertMany({ ...req.body, image: addImage[0]._id })
        await session.commitTransaction()
        res.json("product Added successfully");
    } catch (error) {
        await session.abortTransaction();
        errorMessage(res, error);
        fs.unlinkSync(req.file.path)
    } finally {
        session.endSession();
    }
}

//get slider products
async function getSliderProduct(req, res) {
    try {

        const products = await ProductHomeSliderSchemaModel.find().populate([{ path: "category", select: "name" }, { path: "subCategory", select: "name" }, { path: "image" }])
        res.json(products)
    } catch (error) {
        errorMessage(res, error)
    }
}

//get single product
async function getSingleSliderProduct(req, res) {
    try {
        await paramsId.validateAsync({ id: req.params.id })
        const product = await ProductHomeSliderSchemaModel.findById(req.params.id).populate([{ path: "image" }])
        res.json(product)
    } catch (error) {
        errorMessage(res, error)
    }
}

//update product
async function updateSliderProduct(req, res) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await paramsId.validateAsync({ id: req.params.id })
        const product = await ProductHomeSliderSchemaModel.findById(req.params.id).session(session)
        if (!product) return res.status(404).json("Product Details not found!!")

        //if yes 
        if (req.file) {

            const findImg = await ProductHomeSliderImageModel.findById(product.image).session(session)
            if (findImg) {
                deleteFullImagePath(findImg.pathname)
                await ProductHomeSliderImageModel.findByIdAndDelete(findImg._id).session(session)
            }
            //if not added 
            const addImage = await ProductHomeSliderImageModel.insertMany({ filename: req.file.filename, pathname: `http://${req.headers.host}/${req.file.path}` }, { session })

            await ProductHomeSliderSchemaModel.updateOne({ _id: req.params.id }, { ...req.body, image: addImage[0]._id }, { session })
        } else {
            await ProductHomeSliderSchemaModel.updateOne({ _id: req.params.id }, { ...req.body, image: product.image }, { session })
        }

        await session.commitTransaction()
        res.json("Product Updated Successfully")
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req?.file?.path)
        }
        await session.abortTransaction()
        errorMessage(res, error)
    } finally {
        await session.endSession()
    }
}
//delete api 
async function deleteSliderProduct(req, res) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await paramsId.validateAsync({ id: req.params.id })
        const product = await ProductHomeSliderSchemaModel.findById(req.params.id)
        if (!product) return res.status(404).json("Product not found!!")
        // if yes
        if (product.image) {
            const findImg = await ProductHomeSliderImageModel.findById(product.image)
            deleteFullImagePath(findImg.pathname)
            await ProductHomeSliderImageModel.findByIdAndDelete(findImg._id).session(session)
        }
        
        await ProductHomeSliderSchemaModel.findByIdAndDelete(product._id).session(session)
        await session.commitTransaction()
        res.json("Product Deleted Successfully")
    } catch (error) {
        await session.abortTransaction()
        errorMessage(res, error)
    } finally {
        await session.endSession()
    }
}
module.exports = { addProductSlider, getSliderProduct, getSingleSliderProduct, updateSliderProduct, deleteSliderProduct };
