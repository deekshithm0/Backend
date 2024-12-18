const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    userName: {type: String, trim: true, required: true},
    email: {type: String, unique: true, trim: true, required: true},
    password: {type: String, trim: true, required: true},
    firstName: {type: String, trim: true, default: ''},
    lastName: {type: String, trim: true, default: ''},
    address: {
        street: {type: String, default: ''},
        city: {type: String, default: ''},
        state: {type: String, default: ''},
        zip: {type: String, default: ''},
        country: {type: String, default: ''}
    },
    phone :{type: String, default: ''},
    isAdmin: {type: Boolean, default: false}
})

module.exports = mongoose.model('userData', userSchema)