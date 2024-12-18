
const Category = require('../model/category')
const Subcategory = require('../model/subcategory')
const userController = require('../controller/userController')

const express = require('express')
const routes = express.Router()

routes.get('/home',userController.fetchProducts, userController.getHome)
    .get('/signup', userController.getSignup)
    .get('/login', userController.getLogin)
    .get('/profile', userController.isAuth ,userController.getProfile)
    .get('/product', userController.fetchProducts, userController.getProducts)
    .get('/about', userController.getAbout)
    .get('/contact', userController.getContact)
    .get('/shoping-cart', userController.isAuth ,userController.getShoppingCart)
    .get('/product/:categoryname', userController.fetchProductsByCategory)
    

routes.post('/signup', userController.postSignup)
    .post('/login', userController.postLogin)
    .post('/profile', userController.updateProfile)
    .post('/logout', userController.logout)


module.exports = routes