const {
    ProductDescriptionImagesModel,
    ProductImageModel,
    productThumbnailModel,
    ProductModel,
} = require("../../model/products.model");
const { addProductSchema, paramsId } = require("./validation");
const mongoose = require("mongoose");
const { deleteFiles } = require("../../utils/auth.utils");
const {
    errorMessage,
    deleteFullImagePath,
} = require("../../utils/helpers.utils");


async function addProduct(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await addProductSchema.validateAsync({ ...req.body, createdBy: res.userId }, { abortEarly: false });
        // const images = req.files.map(file => )

        const { images, productThumbnail, productDetailDescriptionImages } =
            req.files;

        const { description, ...rest } = JSON.parse(req.body.productDetails);
        const checkIfProductIsExist = await ProductModel.findOne({
            title: req.body.title,
            productName: req.body.productName,
            category: req.body.category,
            subCategory: req.body.subCategory,
        });

        if (checkIfProductIsExist) {
            res.status(400).json("Prodct already exist");
            deleteFiles(req);
        } else {
            const productDetailDescriptionImagesResult = productDetailDescriptionImages ?
                await ProductDescriptionImagesModel.insertMany(
                    productDetailDescriptionImages?.map(({ path, filename }) => {
                        return { filename, pathname: `http://${req.headers.host}/${path}` };
                    }),
                    { session }
                ) : [];

            const productImagesResult = images ? await ProductImageModel.insertMany(
                images.map(({ path, filename }) => {
                    return { filename, pathname: `http://${req.headers.host}/${path}` };
                }),
                { session }
            ) : [];

            const productThumbnailResult = productThumbnail ? await productThumbnailModel.insertMany(
                productThumbnail?.map(({ path, filename }) => {
                    return { filename, pathname: `http://${req.headers.host}/${path}` };
                }),
                { session }
            ) : [];

            const tagIds = req.body.tags
                .split(",")
                .map((id) => new mongoose.Types.ObjectId(id.trim()));
            let bodyData = {
                ...req.body,
                createdBy: res.userId,
                tags: tagIds,
                images: productImagesResult?.map(({ _id }) => _id),
                productThumbnail: productThumbnailResult[0]?._id,
                productDetails: {
                    ...rest,
                    ...{
                        description: {
                            images: productDetailDescriptionImagesResult.map(
                                ({ _id }) => _id
                            ),
                        },
                    },
                },
            };

            await ProductModel.insertMany(bodyData);
            await session.commitTransaction();
            await session.endSession();
            res.status(200).json("Product added successfully");
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        deleteFiles(req);

        res.status(400).json(error.message);
    }
}





// fetch all products
async function getProducts(req, res) {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) return res.status(404).json("Product not found!!");

        const products = await ProductModel.aggregate([
            {
                $match: {
                    _id: product._id,
                },
            },
            {
                $lookup: {
                    from: "productdescriptionimages",
                    foreignField: "_id",
                    localField: "productDetails.description.images",
                    as: "ProductDescriptionImageRef",
                },
            },
            {
                $lookup: {
                    from: "productimages",
                    foreignField: "_id",
                    localField: "images",
                    as: "images",
                },
            },
            {
                $lookup: {
                    from: "tags",
                    foreignField: "_id",
                    localField: "tags",
                    as: "tags",
                },
            },
            {
                $lookup: {
                    from: "productthumbnails",
                    foreignField: "_id",
                    localField: "productThumbnail",
                    as: "productThumbnail",
                },
            },
            {
                $project: {
                    title: 1,
                    productName: 1,
                    quantity: 1,
                    price: 1,
                    handlingFees: 1,
                    discountedPrice: 1,
                    desc: 1,
                    createdBy: 1,
                    category: 1,
                    productThumbnail: "$productThumbnail",
                    subCategory: 1,
                    tags: {
                        $map: {
                            input: "$tags",
                            as: "tag",
                            in: {
                                value: "$$tag._id",
                                label: "$$tag.name",
                            },
                        },
                    },
                    images: "$images",
                    isPublish: 1,
                    productDetails: {
                        description: {
                            images: "$ProductDescriptionImageRef",
                            content: 1,
                        },
                        specifications: 1,
                        moreInfo: 1,
                    },
                },
            },
        ]);
        res.status(200).json(products[0]);
    } catch (error) {
        errorMessage(res, error);
    }
}

//get short data of products list
async function getShortDataAllProducts(req, res) {
    try {
        const chekUser = res.userId
        const chekUserRole = res.role === "sellar"
        const products = await ProductModel.aggregate([
            ...[((chekUser) && { $match: { ...(chekUserRole && { createdBy: new mongoose.Types.ObjectId(chekUser) }) } })],
            {
                $lookup: {
                    from: "productthumbnails",
                    foreignField: "_id",
                    localField: "productThumbnail",
                    as: "productThumbnail",
                },
            },
            {
                $lookup: {
                    from: "subcategories",
                    foreignField: "_id",
                    localField: "subCategory",
                    as: "subCategory"
                }
            },
            { $unwind: "$productThumbnail" },
            { $unwind: "$subCategory" },
            {
                $project: {
                    title: 1,
                    price: 1,
                    discountedPrice: 1,
                    productThumbnail: "$productThumbnail",
                    subCategory: "$subCategory"
                },
            },
        ]);
        res.status(200).json(
            products.map(({ productThumbnail, ...rest }) => {
                return {
                    ...rest,
                    productThumbnail: {
                        ...productThumbnail,
                        pathname: productThumbnail.pathname,
                    },
                };
            })
        );
    } catch (error) {
        errorMessage(res, error);
    }
}

//delete on product
async function deleteProduct(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        if (!id) return res.status(500).json("please provide id as params");
        const product = await ProductModel.findById(id).session(session);
        if (!product) return res.status(500).json("Product details not found!!");

        if (product.productThumbnail) {
            const thumbnail = await productThumbnailModel
                .findById(product.productThumbnail)
                .session(session);
            if (thumbnail) {
                deleteFullImagePath(thumbnail.pathname);
                await productThumbnailModel
                    .findByIdAndDelete(thumbnail._id)
                    .session(session);
            }
        }

        if (product.images.length > 0) {
            for (const img of product.images) {
                const findImg = await ProductImageModel.findById(img).session(session);
                if (findImg) {
                    deleteFullImagePath(findImg.pathname);
                    await ProductImageModel.findByIdAndDelete(findImg._id).session(
                        session
                    );
                }
            }
        }
        if (product.productDetails.description) {
            for (const img of product.productDetails.description.images) {
                const findImg = await ProductDescriptionImagesModel.findById(
                    img
                ).session(session);

                if (findImg) {
                    deleteFullImagePath(findImg.pathname);
                    await ProductDescriptionImagesModel.findByIdAndDelete(
                        findImg._id
                    ).session(session);
                }
            }
        }

        await ProductModel.findByIdAndDelete(product._id).session(session);
        await session.commitTransaction();
        await session.endSession();
        res.status(200).json("Product Deleted Successfully");
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        errorMessage(res, error);
    }
}

//update products
async function updateProduct(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let {
            deleteimges,
            deletethumbnail,
            deletetdescriptionimages,
            tags,
            productDetails,
            productDetailDescriptionImages: _test1,
            images: _test2,
            productThumbnail: _test3,
            ...rest
        } = req.body;
        let { productThumbnail, images, productDetailDescriptionImages } =
            req.files;

        deleteimges = deleteimges ? deleteimges.split(",") : [];
        deletethumbnail = deletethumbnail ? deletethumbnail.split(",") : [];
        deletetdescriptionimages = deletetdescriptionimages
            ? deletetdescriptionimages.split(",")
            : [];
        tags = tags ? tags.split(",") : [];

        let { description, ...productDetailsData } = JSON.parse(productDetails);

        const updateObj = {
            ...rest,
            "productDetails.moreInfo": productDetailsData.moreInfo,
            "productDetails.specifications": productDetailsData.specifications,
            "productDetails.description.content": description.content,
            tags,
        };

        await ProductModel.updateOne(
            { _id: req.params.id },
            {
                $set: updateObj,
            },
            { session, new: true }
        );

        if (deleteimges?.length) {
            for (const img of deleteimges) {
                const findImg = await ProductImageModel.findById(img).session(session);
                deleteFullImagePath(findImg.pathname);
                //update
                await ProductImageModel.findByIdAndDelete(findImg._id).session(session)
                await ProductModel.updateOne(
                    { _id: req.params.id },
                    {
                        $pull: {
                            images: { $in: deleteimges },
                        },
                    },
                    { session }
                );
            }
        }

        if (productThumbnail) {
            const product = await ProductModel.findById(req.params.id).session(session)
            const findImg = await productThumbnailModel
                .findById(product.productThumbnail)
                .session(session);

            deleteFullImagePath(findImg.pathname);

            await productThumbnailModel.findByIdAndDelete(findImg._id).session(session)

            const productThumbnailImage = productThumbnail
                ? await productThumbnailModel.insertMany(
                    productThumbnail?.map(({ path, filename }) => {
                        return {
                            filename,
                            pathname: `http://${req.headers.host}/${path}`,
                        };
                    }),
                    { session }
                )
                : [];

            await ProductModel.updateOne(
                { _id: req.params.id },
                {
                    $set: { productThumbnail: productThumbnailImage[0]._id },
                },
                { session }
            );

        }

        if (deletetdescriptionimages.length) {
            for (const img of deletetdescriptionimages) {
                const findImg = await ProductDescriptionImagesModel.findById(
                    img
                ).session(session);

                deleteFullImagePath(findImg.pathname);
                await ProductDescriptionImagesModel.findByIdAndDelete(findImg._id).session(session)
            }
            await ProductModel.updateOne(
                { _id: req.params.id },
                {
                    $pull: {
                        "productDetails.description.images": {
                            $in: deletetdescriptionimages,
                        },
                    },
                },
                { session }
            );
        }

        const productImages = images
            ? await ProductImageModel.insertMany(
                images?.map(({ path, filename }) => {
                    return { filename, pathname: `http://${req.headers.host}/${path}` };
                }),
                { session }
            )
            : [];

        if (productImages.length) {
            await ProductModel.updateOne(
                {
                    _id: req.params.id,
                },
                { $push: { images: { $each: productImages.map(({ _id }) => _id) } } },
                { session }
            );
        }

        const productdescriptionimages = productDetailDescriptionImages
            ? await ProductDescriptionImagesModel.insertMany(
                productDetailDescriptionImages?.map(({ path, filename }) => {
                    return { filename, pathname: `http://${req.headers.host}/${path}` };
                }),
                { session }
            )
            : [];

        if (productdescriptionimages.length) {
            await ProductModel.updateOne(
                { _id: req.params.id },
                {
                    $push: {
                        "productDetails.description.images": {
                            $each: productdescriptionimages,
                        },
                    },
                },
                { session }
            );
        }
      
        //temparrory deleting the files
        await session.commitTransaction();

        res.json("Product Updated Successfully");
    } catch (error) {
        deleteFiles(req);
        await session.abortTransaction();
        errorMessage(res, error);
    } finally {
        await session.endSession();
    }
}

//get filter list of the products

async function productFilterList(req, res) {
    try {

        //find by subcategory
        await paramsId.validateAsync({ id: req.params.id })
        const productsFilter = await ProductModel.find({ subCategory: req.params.id }).then(async (products) => {
            const specifications = {}
            products.forEach(product => {
                product.productDetails.specifications.forEach(specification => {
                    if (!specifications[specification.name] && specification.value?.length < 35) {
                        specifications[specification.name] = []
                    }
                    if (!specifications[specification.name]?.includes(specification.value) && specification.value?.length < 35) {
                        specifications[specification.name].push(specification.value)
                    }
                    // if (!specifications[specification.name][specification.value]) {
                    //     specifications[specification.name][specification.value] = specification.value
                    // }
                })
            })
            const productsData = await ProductModel.find({ subCategory: req.params.id }, ["price", "title", 'discountedPrice', "quantity", "createdBy"]).populate([{ path: "productThumbnail", select: "pathname" }])
            return { specifications, productsData }
        })
        if (JSON.stringify(productsFilter) !== JSON.stringify({})) {
            res.json(productsFilter)
        }
        else {
            res.status(400).json("Product Not Found")
        }

    } catch (error) {
        errorMessage(res, error)
    }
}
module.exports = {
    addProduct,
    getProducts,
    getShortDataAllProducts,
    deleteProduct,
    updateProduct,
    productFilterList
};
