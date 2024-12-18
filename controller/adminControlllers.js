
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const Customers = require('../model/userSchema')
const Category = require('../model/category')
const Subcategory = require('../model/subcategory')
const Products = require('../model/product')
const fs = require('fs')
const path = require('path')
const { name } = require('ejs')
const upload = require('../middleware/multer')
const { title } = require('process')


const adminControllers = {
    getAdmin: (req, res) => {
        res.render('adminSide/admin', { title: 'admin' })
    },
    getProducts: async (req, res) => {

        try {
            const products = await Products.find()
            res.render('adminSide/products', { title: 'products', products })
        } catch (error) {
            console.error("Error finding products", error)
            res.status(500).send("Server Error")
        }
    },
    getCustomers: async (req, res) => {
        try {
            const Users = await Customers.find()
            res.render('adminSide/customers', { title: 'customers', Users })
        } catch (error) {
            console.error("Erro finding users", error)
            res.status(500).send("Server error")
        }
    },
    getOrders: (req, res) => {
        res.render('adminSide/orders', { title: 'orders' })
    },
    getCategory: (req, res) => {
        res.render('adminSide/category', { title: 'category' })
    },
    getSubcategory: async (req, res) => {
        try {
            console.log('params', req.params.categoryId)

            const categoryId = req.params.categoryId

            if (!ObjectId.isValid(categoryId)) {
                return res.status(400).send('Invalid category Id')
            }
            const subcategories = await Subcategory.find({ categoryId: categoryId })
            res.json(subcategories)
        } catch (error) {
            console.error('Error loading subcategories', error)
            res.status(500).send('Server Error')
        }
        // res.render('adminSide/subcategory', { title: 'subcategory', category,  subcategory})
    },
    getAddProduct: async (req, res) => {
        try {

            const categories = await Category.find()
            // console.log(categories);
            const firstCat = categories[0]._id
            const subCategories = await Subcategory.find({ categoryId: firstCat })
            res.render('adminSide/addProducts', { title: 'addProducts', categories, subCategories })
        } catch (error) {
            console.error('Error fetching categories amd subcategories')
            res.status(500).send('Server Error')
        }

    },
    addCategory: async (req, res) => {
        const { categoryName, subCategories } = req.body
        try {

            const errorName = [] //empty array for duplicate finding            
            const newCategory = new Category({ name: categoryName }) // const existingCategory = await Category.findOne({ name: categoryName })
            const savedCategory = await newCategory.save()

            const subcategoryPromises = subCategories.map(async (subName) => {
                const dupSubFind = await Subcategory.findOne({ name: subName });
                if (dupSubFind) {
                    errorName.push(subName);
                } else {
                    const newSub = new Subcategory({
                        name: subName,
                        categoryId: savedCategory._id
                    });
                    // console.log('New subcategory to save:', newSub);
                    await newSub.save();
                }
            });
            await Promise.all(subcategoryPromises);

            if (errorName.length > 0) {
                return res.json({ success: false, message: `${errorName.join(',')} are existing` })
            }

            res.json({ success: true })
        } catch (error) {
            console.error(error.message)
            res.status(500).json({ success: false, error: 'Server error' })
        }
    },
    listCategory: async (req, res) => {
        try {
            const categories = await Category.find()
            res.render('adminSide/viewCategory', { title: 'viewCategory.ejs', categories })
        } catch (error) {
            console.error(error.message)
            res.status(500).json({ error: 'Server Error' })
        }
    },
    editCategory: async (req, res) => {
        try {
            const catid = req.params.id
            const subcategory = await Subcategory.find()
            // console.log(subcategory);
            const CatFind = await Category.findById(catid)
            // console.log(catid);         
            const subFind = subcategory.filter(element => {
                if (element.categoryId.toString() === catid) {
                    return element
                }
            })
            res.render('adminSide/editCategory', { title: 'editcategory', CatFind, subFind, subcategory })
        } catch (error) {
            console.log(error.message);
        }
    },
    postCategory: async (req, res) => {
        try {
            const catId = req.params.id
            const { CategoryEdit, subcategoryEdit, addSubcategory } = req.body
            await Category.findByIdAndUpdate(catId, { name: CategoryEdit })
            const existingSubcategories = await Subcategory.find({ categoryId: catId })

            if (subcategoryEdit && subcategoryEdit.length > 0) {
                const updatedSub = subcategoryEdit.map(async (subName, index) => {
                    const existingSubcategory = existingSubcategories[index]
                    if (existingSubcategory) {
                        return Subcategory.findByIdAndUpdate(existingSubcategory._id, { name: subName.trim() })
                    }
                    await Promise.all(updatedSub)
                })
            }
            if (addSubcategory && addSubcategory.trim() !== '') {
                const newSub = new Subcategory({
                    name: addSubcategory.trim(),
                    categoryId: catId
                })
                await newSub.save()
            }
            res.redirect(`/admin/editCategory/${catId}`)
        } catch (error) {
            console.error(error)
            res.status(500).send('Server Error')
        }
    },
    editSubCategory: async (req, res) => {
        try {
            const { subId, subName } = req.params
            // console.log(subId, subName);
            const duplicate = await Subcategory.findOne({ name: subName })
            if (!duplicate) {
                await Subcategory.updateOne({ _id: subId }, { $set: { name: subName } })
                res.status(200).json({ success: true })
            }
        } catch (error) {
            console.error(error)
            res.status(400).json({ success: false })
        }
    },
    addProducts: async (req, res) => {
        try {
            // console.log("req.files: ",req.files);
            // console.log("Req.body: ",req.body)
            const { productName, description, price, quantity, category, subcategory } = req.body
            // console.log(productName, description, price, category, subcategory);
            const productImages = req.files.map(file => file.filename)

            const newProduct = new Products({
                productName,
                description,
                price,
                quantity,
                categoryId: category,
                subCategoryId: subcategory,
                productImages
            })
            await newProduct.save()
            res.redirect('/admin/addProducts?success=true')
        } catch (error) {
            console.error('Error adding products: ', error)
            res.status(500).send('Server error')
        }
    },
    editProduct: async (req, res) => {
        try {
            const productId = req.params.id
            const category = await Category.find()
            const subcategory = await Subcategory.find()
            // console.log(productId);
            const productData = await Products.findById(productId)
            const catData = await Category.findById(productData.categoryId)
            const subData = await Subcategory.findById(productData.subCategoryId)
            console.log(subData);
            // const subData = await Subcategory.findById(productData.subCategoryId)
            console.log(catData);
            res.render('adminSide/editProduct', { title: 'editProduct', productData, category, catData, subData, subcategory })
        } catch (err) {
            console.log(err)
            res.status(500).send('Server Error')
        }
    },
    updateProduct: async (req, res) => {
        // console.log("Recieved request to update product!");
        const { id } = req.params
        // console.log(id);
        // console.log(req.body);
        const { productName, productDescription, productPrice, quantity, category, subcategory, removeImages } = req.body
        try {
            const product = await Products.findById(id)

            if (!product) {
                res.status(404).send('Product not found...')
            }

            if (removeImages) {
                const imagesToRemove = Array.isArray(removeImages) ? removeImages : [removeImages]
                imagesToRemove.forEach(image => {
                    // const imagePath = `/public/productImages${image}`
                    const imagePath = path.join(__dirname, '..', 'public', 'productImages', image)
                    if (fs.existsSync(imagePath)) { //checking the existence of imagePath
                        fs.unlinkSync(imagePath) //removing image from the server
                    }
                    product.productImages = product.productImages.filter(img => img !== image) //updating the productImages array                    
                })
            }

            if (req.files) {
                const newImages = req.files.map(file => file.filename);
                product.productImages.push(...newImages)
            }
            console.log(req.files);

            product.productName = productName;
            product.description = productDescription;
            product.price = productPrice;
            product.quantity = quantity;
            product.categoryId = category;
            product.subCategoryId = subcategory;


            await product.save();
            res.redirect(`/admin/editProduct/${id}`)
        } catch (error) {
            console.log(error)
            res.status(500).send('Internal server error...')
        }
    },
    editCustomer: async (req, res) => {
        try {
            const userId = req.params.id
            const userData = await Customers.findById(userId)
            console.log(userData);
            
            console.log("Reached controller");
            res.render('adminSide/editCustomer', { title: 'editCustomer', userData })
        } catch (error) {
            console.log(error)
            res.status(500).send('Server error')
        }
    }

}

module.exports = adminControllers

