//CRUD create read update delete  
const {MongoClient,ObjectID} = require('mongodb')

connectionURL = "mongodb://127.0.0.1:27017"
const databaseName = "task-manager"

MongoClient.connect(connectionURL,{ useNewUrlParser:true, useUnifiedTopology: true},(error,client)=>{
    if(error)
    {
        return console.log('Unable to connect database')
    }
    const db = client.db(databaseName)
    // db.collection('users').updateMany({completed:'false'},{ 
    //     $set:{
    //        completed:'true' 
    //     }
    // }).then((result)=>{
    //     console.log(result)
    // }).catch((error)=>{
    //     console.log(error)
    // })

    db.collection('users').deleteOne({
        _id:new ObjectID('605f9fb86b2ad417702e1730')
    }).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })

})
