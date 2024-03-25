const authController = require('../controllers/authController')
const taskController = require('../controllers/taskController')
const express = require('express')
const taskRouter = express.Router(); 

const {getAllTasks, createTask, findTaskById, updateTask, deleteTask} = require('../controllers/taskController')


//PROTECTED ROUTE!
taskRouter 
    .route('/')
    .get( taskController.getAllTasks)
    .post(authController.protect, taskController.createTask)

taskRouter 
    .route('/:id') 
    .delete(authController.protect, taskController.deleteTask)
    .get(taskController.findTaskById)
    .patch(authController.protect,
        authController.restrictTo('admin'), 
        taskController.updateTask)



    // taskRouter.post('/',createTask )
// taskRouter.get('/',protect, getAllTasks )
// taskRouter.get('/:id', findTaskById)
// //IMPORTANT: PUT REQUEST WILL REPLACE THE ENTIRE OBJECT! 
// //PATCH PARTIAL REPLACEMENT!
// taskRouter.patch('/:id', updateTask)
// taskRouter.delete('/:id',deleteTask )
// taskRouter.get('/', (req,res,next) => {

//     const tasks = [{id:1, name:'Gym', priority: 10, isCompleted: true, createdAt: new Date().toISOString()}]

//     res.status(200).json({status:'success',
//     size:tasks.length,
//      data:{
//         tasks
//     }})
// })



module.exports = taskRouter