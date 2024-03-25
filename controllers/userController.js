
const User = require('../models/User')
const catchAsync = require('../util/catchAsync')
const AppError = require('../util/AppError')

/**IMPORTANT - BY SETTING THE User Model password:{..., select:false} - findOne() output will not include the password! OK
 */
exports.getAllUsers = catchAsync(async (req,res,next) =>{

    const users = await User.find(); 

    console.log('users:', users)

    res.status(200).json({
        status:'success',
        results:users.length, 
        data:{
            users
    }})

})

exports.createUser = catchAsync(async (req,res,next) =>{

    const newUser = await User.create(req.body)
    
    console.log('newUser ', newUser)

    res.status(201).json({
        status:'success', 
        data:{
            user:newUser
        }

    })

})


// const findTaskById = catchAsync(async (req,res, next)=>{
    
//         const task = await Task.findById(req.params.id)

//         console.log(task)

//         // MUST RETURN next()  (but it worked for me even without)
//         if(task === null)
//          {
//             const err = new AppError(`task with id ${req.params.id} not found`, 404)
//             return next(err)

//             //OR SIMPLY : (my solution)
//            // throw err;
//          }

//         res.status(200).json({
//             status:'success', 
//             data:{
//                 task
//             }
//         })
//     }
   
// ) 
exports.findUserById = catchAsync(async (req,res,next) =>{

    const user = await User.findById(req.params.id)

    //IF NO USER FOUND IN DB - THEN MONGOOSE RETURNS NULL - NOT THROW!
    // - THEN  I SHOULD THROW AN ERROR OF MY OPERATIONAL ERROR - AND PASS TO GLOBAL ERROR M.W
    if(user === null)
    {
        const err = new AppError(`User with id ${req.params.id} not found!`)
       return  next(err)

    }

    res.status(200).json({
        status:'success', 
        data:{
            user
        }
    })



})


exports.updateUser = catchAsync(async (req,res,next) =>{

})

exports.deleteUser = catchAsync(async(req,res,next) =>{

})