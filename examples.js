const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/users')
const Task = require('./models/task')
const myFunction = async ()=>{
    const password = 'Samcrowm!'
    const hashedPassword =  await bcrypt.hash(password,8)
    console.log(password)
    console.log(hashedPassword)
    const isMatch = await bcrypt.compare('Samcrowm!',hashedPassword)
    console.log(isMatch)
}

const myfunction2 = async () =>{
const token =   jwt.sign({ _id:'sam1234' }, 'thisisnodecourse', { expiresIn: '5 minutes'})
console.log(token)
//verifying the token
const data = jwt.verify(token,'thisisnodecourse')
console.log(data)
}

myfunction2()
//myFunction()

const pet = {
    name:'Smart'
}
pet.toJSON = function(){
    console.log(this)
    return this
}
console.log(JSON.stringify(pet))

const main = async ()=>{
    const task = await Task.findById('607c6fb29bcbf71540eca5b7')
    await task.populate('owner').execPopulate() //it find the relationship using 'ref' on task model to get all the 
    console.log(task.owner.name)                        //information related to task
    
    const user = await User.findById('607c6e21c53ecd16e05e9cd9')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
    
    const user = await User.findById(task.owner)
    console.log(user.name)
    }
    
    main()