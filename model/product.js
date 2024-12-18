
const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    productName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, ref: 'Category', required: true },
    quantity: {type: Number, required: true},
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category',required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'subcategory',required: true },
    productImages: [{ type: String, required: true }]
    // date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Product', productSchema)