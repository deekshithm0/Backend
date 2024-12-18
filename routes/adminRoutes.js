
const express = require('express')
const routes = express.Router()
const adminController = require('../controller/adminControlllers')
const upload = require('../middleware/multer')


routes.get('/', adminController.getAdmin)
    .get('/products', adminController.getProducts)
    .get('/customers', adminController.getCustomers)
    .get('/orders', adminController.getOrders)
    .get('/category', adminController.listCategory)
    .get('/editCategory/:id', adminController.editCategory)
    .get('/addCategory', adminController.getCategory)
    .get('/addProducts', adminController.getAddProduct)
    .get('/subcategory/:categoryId' , adminController.getSubcategory)
    .get('/editProduct/:id', adminController.editProduct)
    .get('/customers/editCustomer/:id', adminController.editCustomer)

routes.post('/category', adminController.addCategory)
    .post('/editCategory/:id', adminController.postCategory)
    .post('/editSubcategory/:subId/:subName' , adminController.editSubCategory)
    .post('/products/addProducts', upload.array('productImages', 10), adminController.addProducts)
    .post('/editProduct/:id', upload.array('newImages', 10), adminController.updateProduct)
    


module.exports = routes