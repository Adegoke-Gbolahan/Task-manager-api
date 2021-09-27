const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify:false
})



// const me = new User({
//     name:'Adegoke Gbolahan   ',
//     email:'SAMADEX5050@gmail.com',
//     password:'Samcrown24.',
    
// })

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log('Error: ' + error)
// })



