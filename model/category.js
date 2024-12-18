
    const mongoose = require('mongoose')
    const categorySchema = mongoose.Schema({
        name : {
            type: String,
            required: true,
            unique : true
        }
        // subcategories: [subcategorySchema]
    })

    module.exports = mongoose.model('category', categorySchema)