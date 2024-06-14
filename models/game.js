// blog_app/models/article.js
const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    good_answer: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    date: { type: Date, default: Date.now },
});

const Game = mongoose.model("game", GameSchema);
module.exports = Game;
