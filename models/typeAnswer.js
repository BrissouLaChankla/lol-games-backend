// blog_app/models/article.js
const mongoose = require("mongoose");

const typeAnswerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: { type: Date, default: Date.now },
});

const typeAnswer = mongoose.model("type_answer", typeAnswerSchema);
module.exports = typeAnswer;
