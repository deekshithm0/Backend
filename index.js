const express = require('express')
const app = express()
const path = require('path')
const adminRoutes = require('./routes/adminRoutes')
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes')

dotenv.config();
connectDB();

app.set('view engine' , 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname , 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret : 'secret_key',
    resave : false,
    saveUninitialized : true
}))

app.use('/', userRoutes)
app.use('/admin', adminRoutes)

const PORT = process.env.PORT || 3003;
app.listen(PORT, ()=> {
    console.log('connected to server');
})
