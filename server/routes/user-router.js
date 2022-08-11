const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { findOne } = require('../models/User');
const { trusted } = require('mongoose');

const router = express.Router()

router.get('/', async (req, res, next) => {
    let users;
    try{ 
        users = await User.find()
    } catch(err) {
        console.log(err)
    }
    if(!users){
        return res.status(404).json({message: "No users found"})
    }
    return res.status(200).json({users})
})

router.post('/signup', async (req, res, next)=> {
    const {name, email, password} = req.body;
    
    let existingUser;
    
    try{
        existingUser = await User.findOne({email})
    }catch(err){
        console.log(err);
    }
    if(existingUser) {
        return res.status(400).json({message: 'User already exists, Login instead'})
    }
    const hashedPassword = bcrypt.hashSync(password)
    const user = new User({
        name,
        email,
        password: hashedPassword,
        blogs: []
    })
    try{
        await user.save()
    }catch(err) {
        console.log(err)
    }
    return res.status(201).json({user})

})

router.post('/login', async (req, res, next)=> {
    const {email, password} = req.body;

    let existingUser
    
    try {
        existingUser = await User.findOne({email})
    } catch (err) {
        console.log(err)
    }
    if(!existingUser) {
        res.status(404).json({message:'Cannot find user by this email!'})
    }else{
        const isPasswordValid = bcrypt.compareSync(password, existingUser.password)
        if(!isPasswordValid){
            return res.status(400).json({message:'Invalid Password'})
        }
        return res.status(200).json({message:'Login successful.', user: existingUser})
    }


    // if(!isPasswordValid){
    //     return res.status(400).json({message:'Invalid Password'})
    // }
    // return res.status(200).json({message:'Login successful.', user: existingUser})
})
module.exports = router