const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    }, 
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    blogs: [{type: mongoose.Types.ObjectId, ref: "Blog", required: true}]
})

module.exports = mongoose.model('User', userSchema)