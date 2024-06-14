// blog_app/models/article.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    time: {
        type: Number,
        default: 10,
        required: true,
    },
    type_answer: { type: mongoose.Schema.Types.ObjectId, ref: 'type_answer' },
    date: { type: Date, default: Date.now },
});

const Category = mongoose.model("category", CategorySchema);
module.exports = Category;
