const express = require('express')
const { default: mongoose } = require('mongoose')
const Blog = require('../models/Blog')
const User = require('../models/User')
const router = express.Router()

router.get('/', async(req,res,next)=> {
    let blogs;
    try {
        blogs = await Blog.find().populate('user');
    }catch(err){
        return console.log(err);
    }
    if(!blogs) {
        return res.status(404).json({message:'No blogs found'})
    }
    return res.status(200).json({blogs})
})

router.post('/post', async(req,res,next)=> {
    const {title, description, image, user} = req.body;

    let existingUser

    try {
        existingUser = await User.findById(user)
    } catch(err) {
        console.log(err)
    }
    
    if(!existingUser){
        return res.status(400).json({message: "Unable to find user by this ID"})
    }

    const blog = new Blog({
        title,
        description,
        image,
        user
    });
    try {
        const session = await mongoose.startSession();
        session.startTransaction()
        await blog.save({session})
        existingUser.blogs.push(blog)
        await existingUser.save({session})
        await session.commitTransaction()
    } catch(err) {
        return console.log(err)
        return res.status(500).json({message: err})
    }
    return res.status(200).json({blog})
})

router.put('/update/:id', async(req,res,next)=> {
    const {title, description} = req.body
    const blogID = req.params.id
    let blog
    try{
        blog = await Blog.findByIdAndUpdate(blogID, {
            title,
            description
        })
    } catch (err) {
        console.log(err)
    }
    if(!blog) {
        return res.status(500).json({message: 'Unable to update blog'})
    }
    return res.status(200).json({blog})
})

router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    let blog
    try {
        blog = await Blog.findById(id)
    } catch (err) {
        return console.log(err)
    }
    if(!blog) {
        return res.status(404).json({message: 'No blog found'})
    }
    return res.status(200).json({blog})
})

router.delete('/:id', async(req, res, next)=> {
    const id = req.params.id
    let blog
    try {
        blog = await Blog.findByIdAndRemove(id).populate('user')
        await blog.user.blogs.pull(blog)
        await blog.user.save()
    } catch(err) {
        console.log(err)
    }
    if(!blog) {
        res.status(500).json({message: 'Cannot delete blog'})
    }
    return res.status(200).json({message: 'Successfully deleted blog'})
})


router.get('/user/:id', async(req,res,next)=> {
    const userID = req.params.id

    let userBlogs
    
    try{
        userBlogs = await User.findById(userID).populate('blogs')
    }
    catch (err) {
        return console.log(err)
    }
    if(!userBlogs) {
        return res.status(404).json({message: 'No blogs found for this user'})
    }
    return res.status(200).json({blogs: userBlogs})
})

module.exports = router