const mongoose = require('mongoose')
const model = require('mongoose').model; 


//NOTE : FIELDS ON THE HOME PAGE SHOULD BE  REQUIRED
const taskSchema = new mongoose.Schema({
    name:{
        type:String, 
        required:[true, 'A task must have a name'],
        
        //unique:true
        
    }, 
    priority:{
        type:Number, 
        required:[true, 'A task must have a priority']
    },
    isCompleted:{
        type:Boolean, 
        required:true, 
        default:false
    },
    //timestamp 
    createdAt:{
        type:Date , //JS DATA TYPE -> I CAN USE IT !
        default:Date.now() //NOTE:: Date.now() returns a timestamp(ms) and mongo convert it to the current data format
    }, 
    description:{
        //required:false , 
        type:String , 
         //remove white spaces from beginning etc.
        trim:true
    }, 
   
})


 Task = new model('Task', taskSchema); 





 //EXPORT THE Task instance 
 module.exports = Task;


//  const testTask = new Task(
//     {
//         name:'Nir', 
//         priority:9, 
//         isCompleted:true
//     }
//  )


// testTask.save()
// .then(result => console.log(result))
// .catch(err => console.log(err.message))
