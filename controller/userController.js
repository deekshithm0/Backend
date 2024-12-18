
const bcrypt = require('bcrypt')
const User = require('../model/userSchema')
const Product = require('../model/product')
const Category = require('../model/category')
const Subcategory = require('../model/subcategory')


module.exports = userController = {
    fetchProducts: async (req, res, next) => {
      try {
        const products = await Product.find()
        req.products = products
        // res.json(products)
        next()
      } catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
      }
    },
    getHome: (req, res) => {
        // console.log(req.products)
        res.render('userSide/home', {products: req.products })
    },
    getSignup: (req, res) => {
        try {
            if(!req.session.user){
                const errors = req.session.errors || {}
                const formData = req.session.formData || {}
                req.session.errors = null
                req.session.formData = null
                res.render('signup', { errors, formData })
            }else{
                res.redirect('profile')
            }
        } catch (err) {
            console.log(err)
            res.status(500).send('Server Error')
        }
    },
    getLogin: (req, res) => {
        try {
            if(!req.session.user){
                res.render('login')
            } else{
                res.redirect('profile')
            }
        } catch (err) {
            console.log(err)            
            res.status(500).send('Server error')
        }
    },
    postSignup: async (req, res) => {
        try {
            const { userName, email, password, confirmPassword } = req.body
            req.session.errors = {}
            req.session.formData = { userName, email }
            //validation for name
            if (userName === '') {
                req.session.errors.nameError = "Please enter a name here"
            } else if (userName.length < 3) {
                req.session.errors.nameError = "Enter atleast 3 characters"
            }
            //validation for email
            const emailRegex = /^[a-zA-Z0-9]{5,30}@[a-zA-Z]{2,7}.[a-zA-Z]{1,5}$/;
            if (email === '') {
                req.session.errors.emailError = "Enter an Email "
            } else if (!emailRegex.test(email)) {
                req.session.errors.emailError = "Enter a valid email"
            } else {
                const existingEmail = await User.findOne({ email })
                if (existingEmail) {
                    req.session.errors.emailError = "User already registered"
                }
            }
            // validation for password
            const passRegex = /^(?=.*[!@#$%^&*()\-_+=|\\{}\[\]:;"'<>,.?/])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/;
            if (password === '') {
                req.session.errors.passError = "Enter a password"
            } else if (!passRegex.test(password)) {
                req.session.errors.passError = "Password must be in a valid format!"
            } else if (password.length < 8) {
                req.session.errors.passError = "Enter atleast 8 characters"
            }
            //validation for confirm password
            if (confirmPassword === '') {
                req.session.errors.cpassError = "confirm your password"
            } else if (confirmPassword != password) {
                req.session.errors.cpassError = "Passwords not matching"
            }
            //check for any validation error
            if (Object.keys(req.session.errors).length > 0) {
                return res.redirect('/signup')
            }
            //password hashing after successfull validation
            const saltRounds = 10
            const hashedPassword = await bcrypt.hash(password, saltRounds)
            //saving hashedPassword to newUser
            const newUser = new User({
                userName,
                email,
                password: hashedPassword
            })
            //saving data to db
            await newUser.save()
            res.send("Data saved")
        } catch (err) {
            console.log(err);
            res.status(500).send('Server error')
        }
    },
    postLogin: async (req, res) => {
      try {
        // console.log(req.body);
        const {userCred, password} = req.body 
        const user = await User.findOne({
            $or: [
                {userName: userCred},
                {email: userCred}
            ]
        })
        if(!user){
            return res.status(400).json({error: "User not found"})
        } 
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({error: "Invalid Password"})
        }    
        req.session.user = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            address: user.address
        }
        res.status(200).json({message: "Login successfull"})
            
      } catch (err) {
        res.status(500).send("server error")
      }
        
    },
    getProfile: async (req, res) => {
        try {
         const user = await User.findById(req.session.user._id)   
         res.render('userSide/profile', {user})
        } catch (error) {
            res.status(500).send('Error retrieving profile');
        }
    },
    updateProfile: async (req, res) => {
        try {
            const {userName, email, firstName, lastName, phone, address} = req.body
            await User.findByIdAndUpdate(req.session.user._id, {
                userName, 
                email,
                firstName,
                lastName,
                phone,
                address
            })
            res.redirect('/profile')
        } catch (err) {
            console.log(err)
            res.status(500).send('Server Error')
        }
    },
    logout: (req, res) => {
        req.session.destroy(err => {
            if(err){
                return res.status(500).json({message: 'Failed to logout...'})
            }
            res.status(200).json({message: 'Logout successfully!'})
        })
    },
    isAuth: (req, res, next) => {
        if(req.session.user){
            next()
        }
        else{
            res.redirect('/login')
        }
    },
    getProducts: async (req, res) => {
        // try {
        //     const { query, category, sub_category, price } = req.body

        //     const filterQuery = {}
        //     if (category) {
        //         filterQuery.category = category
        //     }
        //     if (sub_category) {

        //     }
        //     if (query) {

        //     }
        //     if (price) {

        //     }
        //     const products = await Product.find(filterQuery)

        //     if (! products) {
        //         res.status(500).send("Oops! Something went wrong")
        //     } else {
        //         res.status(200).json({
        //             status: true,
        //             message: '',
        //             data: products
        //         })
        //     }
        // } catch (error) {
        //     res.status(500).send("Oops! Something went wrong")
        // }

        const productsPerPage = 12
        const page = parseInt(req.query.page) || 1
        const skip = (page - 1) * productsPerPage 

        try {
            const productCount = await Product.countDocuments()
            const totalPages = Math.ceil( productCount / productsPerPage )
            const products = await Product.find().skip(skip).limit(productsPerPage)
            
            res.render('./userSide/product', {products: products, currentPage: page, totalPages})
        } catch (err) {
            console.log(err)
            res.status(500).send("server Error!")
        }

    },
    getAbout: (req, res) => {
        res.render('./userSide/about')
    },
    getContact: (req, res) => {
        res.render('./userSide/contact')
    },
    getShoppingCart: (req, res) => {
        res.render('./userSide/shoping-cart')
    },
    fetchProductsByCategory: async (req, res) => {
       try {
        const categoryname = req.params.categoryname
        const category = await Category.findOne({name: categoryname})

        const productsPerPage = 12
        const page = parseInt(req.query.page) || 1
        const skip = (page - 1) * productsPerPage

        if(!category){
            return res.status(404).send("Category not found!")
        }

        const productCount = await Product.countDocuments({categoryId: category._id})
        const totalPages = Math.ceil( productCount / productsPerPage)
        const products = await Product.find({categoryId: category._id}).skip(skip).limit(productsPerPage)

        // console.log(products)
        res.render('./userSide/product', {products: products, currentPage: page, totalPages: totalPages})
       } catch (err) {
        console.error(err)
        res.status(500).send("Server Error!")
       }
    }
}