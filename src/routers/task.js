const express = require('express')
const route = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

//GET /task
//GET /task?sortBy=createdAt:desc
route.get('/tasks', auth, async (req,res)=>{
    const match = {} 
    const sort ={}
    if(req.query.sortBy){
        const part = req.query.sortBy.split(':')
        sort[part[0]] = part[1] === 'desc' ? -1 : 1
    } 
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }                   
    try{
        //const task = await Task.find({owner:req.user._id})
        // await req.user.populate('tasks').execPopulate()
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip:  parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
})

route.get('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id
    
    try{
       // const task = await Task.findById(_id) //this works too
       const task = await Task.findOne({_id, owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }

})

route.patch('/tasks/:id', auth, async (req,res) =>{
    updates = Object.keys(req.body)
    allowUpdates = ["description","completed"]
    isValidOperation = updates.every((update)=> allowUpdates.includes(update))
    if(!isValidOperation)
    {
        return res.status(400).send({error:'Update Error'})
    }
    
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        updates.forEach((update) => task[update] = req.body[update])
        task.save()
       
       
        //const task = await Task.findOneAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
        if(!task)
        {
           return res.status(404).send({error:'User does not Exist '})
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})



route.post('/tasks',auth, async (req,res)=>{
   // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

route.delete('/tasks/:id', auth, async (req, res)=>{
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = route