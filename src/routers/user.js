const express = require('express')
const User = require('../models/users')
const auth = require('../middleware/auth')
const route = new express.Router()
const multer = require('multer')
const sharp = require('sharp')

route.get('/test',(req,res)=>{
    res.send('Testing route')
})

const avatar = multer({
    limits: {
        fileSize: 1000000
    },
        fileFilter(req,file,cb){
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
                return cb(new Error('Only Jpg,Jpeg and PNG is allowed'))
            }
            cb(undefined,true)
        }
})

route.post('/user/logoutAll', auth, async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
route.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
        
    } catch (e) {
        res.status(500).send()
    }
})
route.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
    
})

route.post('/user/login', async (req,res) =>{
    try {
        const user = await User.FindByCredential(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
       
       // res.send({ user: user.getPublicProfile(), token })
        res.send({ user,token })
    } catch (e) {
        res.status(400).send()        
    }
})
route.get('/users/me', auth, async (req,res)=>{
    res.send(req.user) 
    // try{
    //     const user = await User.find({})
    //     res.send(user)
    // }catch(e){
    //     res.status(500).send(e)
    // }
})

route.patch('/users/me', auth, async (req,res)=>{
const updates = Object.keys(req.body)  //convert object to array grabing the keys
const allowUpdates = ["name","age","email","password"]
const isValidOperation = updates.every((update)=> allowUpdates.includes(update))

if(!isValidOperation){
    return res.status(400).send({error: 'Invalid Updates'})
}

    try {
        updates.forEach((update) =>req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

route.delete('/users/me', auth, async (req, res)=>{
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

route.post('/user/me/avatar', auth, avatar.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).png().resize({width: 250, height:250}).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

route.delete('/user/me/avatar', auth, async (req,res)=>{
    try {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
    } catch (e) {
        res.status(500).send()
    }
})

route.get('/user/:id/avatar', async (req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        // set the type of image to be sent using request header
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = route