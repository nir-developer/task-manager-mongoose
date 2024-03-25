
const Task = require('../models/Task')
const AppError = require('../util/AppError')
const catchAsync = require('../util/catchAsync')
/**IMPORTANT - DOCS:  Model.prototype.methodXXX : 
 *      -  Model.prototype is an object created from a Class constructor /Function constructor 
 *      => methodXXX - is a method called from a document - NOT ON A TOUR (since this method is on the object prototype)

            EXAMPLE:
             const task = new Task(req.body)
             task.save();  

             => task has access to the save method! since it is part of the prototype object of the Task class
            =

 * 
 */


    
// const catchAsync = fn => {

//     //console.log('catchAsync called')
//     //fn is an async function => it returns a promise -> can use catch on it
//     return (req,res,next) => {
//         fn(req,res,next) //PROMISE
//         .catch(next)//REJECTED PROMISE - CATCH IT!
    
//     }
// }

/**IMPORTANT:
 *  I COULD WRAP THE async function in the router instead of the controller : 
        router.route('/') 
        .get(catchAsync(tourController.getAllTours))
        .post(tourController.createTour)  

    BUT THIS WAY IS LESS CONVIENT - I NEED TO REMEMBER WHICH METHODS ARE ASYNC FUNCTIONS 

 */
const createTask =  catchAsync(async (req,res,next) => {
    console.log('CREATED NEW TASKS')
    //ONLY REQUEST HANDLING LOGIC !!!NOT ERROR HANDLING!!
    const newTask = await Task.create(req.body)
   //const newTask = await Task.create({name:'NIR'})

        res.status(201).json({
            status:'success', 
            data:{
                task:newTask
            }
        })

})

const findTaskById = catchAsync(async (req,res, next)=>{
    
        const task = await Task.findById(req.params.id)

        console.log(task)

        // MUST RETURN next()  (but it worked for me even without)
        if(task === null)
         {
            const err = new AppError(`task with id ${req.params.id} not found`, 404)
            return next(err)

            //OR SIMPLY : (my solution)
           // throw err;
         }

        res.status(200).json({
            status:'success', 
            data:{
                task
            }
        })
    }
   
) 

//REST - BEST PRACTICE - DONT SEND BACK TO THE CLIENT WHEN DELETE!
const deleteTask = catchAsync(async (req,res,next)=>{


        const task = await Task.findByIdAndDelete(req.params.id)
        //OK - IT WORKS!
        //if(!deletedTask ) throw new Error('Could not delete!')

        if(task === null)
         {
            const err = new AppError(`task with id ${req.params.id} not found`, 404)
            return next(err)
         }
        
        console.log(task)

        res.status(204).json({
            status:'success'
            
        })
})


const updateTask = async(req,res,next) => {

         //third parameter - to return the new modified document - rather than original - by default set to false
        //forth parameter - to re run the validator
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new:true,
            runValidators:true    
        })

        //I SHOULD THROW THE ERROR - SINCE MONGOOSE DOES NOT THROW FOR WHEN A DOCUMENT IS NOT FOUND!
        if(task === null)
            {
                const err = new AppError(`task with id ${req.params.id} not found`, 404)
                return next(err)

                //OR SIMPLY : (my solution)
            // throw err;
            }

        
        //console.log('UPDATED TASK: ', task)
        
        res.status(201).json({
            status:'success', 
            data:{
                task
            }
        })

    }


//////////////////////////////////////////////////////////////////////
//FIRST COMPLETE THIS FUNCTION WITH MAKING API BETTER! AGGRAGETE
const getAllTasks = async (req,res) => {

    try 
    {
        //BUILD QUERY 
        //FEATURE 1A) Filtering
        //create a shallow  copy using the destructuring operator  (...)
       const queryObj = {...req.query}
       const excludeFields = ['page', 'sort', 'limit', 'fields']
       
       excludeFields.forEach(el => {
            delete queryObj[el]
       })
       


     //FEATURE 1.B: ADVANCED FILTERING 
        //BUILD THE QUERY(DON'T EXECUTE IT!)
    let queryStr  = JSON.stringify(queryObj)

    //REGEX:
    // \b for exact match 
    // /g  for multiple occurrence
    queryStr  = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)



    //OUTPUT: OK withthe $ : { name: 'Gym', priority: { '$gte': '8' } }
    //console.log(JSON.parse(queryStr))
    
    
    
    //BUILD THE QUERY OBJECT!(without executing it!)
    let  query =  Task.find(JSON.parse(queryStr))
    
    
    
    //FEATURE 2: SORTING (sent as 1 or 0 in the request query  string) 
    if(req.query.sort)
    {
    
        const sortBy = req.query.sort.split(',').join(' ')
        //MONGOOSE NEEDS THE ' ' BETWEEN THE FIELDS TO SORT
         query  = query.sort(sortBy)
        
    }
    //default sorting if not provided in the query string: 
    //newest first(descending order)
    else 
    {
        query = query.sort('-createdAt')
    }
    
    
    //3) FEATURE 3: FIELD LIMITING(REDUCE THE BANDWIDTH FROM THE CLIENT)
    //SIMILAR before with sorting   query.sort() : query.select() 
    //MONGOOSE query.select() requires the fields to be separated with ' '
    //HOT TO GET RID OF THE ID?? HE SAID I CAN NOT!
    if(req.query.fields)
    {
       // req.query.fields => INCLUDING
        const fields =  req.query.fields.split(',').join(' ')
        query.select(fields)
    }
    //no query param 'fields' provided 
    //SELECT ALL DATA -EXCEPT __v OF MONGOOSE
    else
    {
        query = query.select('-__v')
    }
    
    
    //4) FEATURE: PAGINATION
    //page=2&limit=10
    //=> USER WANTS PAGE 2 WITH 10 RESULTS PER 
    //=> I SHOULD SKIP THE FIRST 10 RESULTS: (page -1) * #results_per_page
     //convert string to a number(if present) ! and set a default to 1 
    const page = req.query.page * 1 || 1

    const limit = req.query.limit * 1 || 100; 

    //compute the skip value: page=3 with limit=10
    const skip = (page - 1) * limit ;
   

    query = query.skip(skip).limit(limit)

    //CHECK IF THE USER PASSED A PAGE IN THE QUERY STING AND IF REQUESTED PAGE EXIST-
    // IF NOT - THROW AN ERROR!(INSTEAD OF RETURNING AN EMPTY ARRAY)
    if(req.query.page )
    {
        const numTasks = await Task.countDocuments();
        //throw new Error('THE PAGE CAN NOT BE FOUND!!')
        if(skip >= numTasks) throw new Error('This page does not exist')
    }




    //STEP 2 :EXECUTE THE QUERY (thenable type - not a promise!)
       const tasks = await query;

       //BUILD THE RESPONSE AND SEND IT TO THE CLIENT!!
        res.status(200).json({
            status:'success', 
            results: tasks.length, 
            data:{
                tasks:tasks 
            }
        })
        }
        catch(err)
        {
            console.log(err.message)
            res.status(404).json({
                status:"fail", 
                message:err.message
            })

        }

    }


     



//IMPORTANT: I CAN PASS PARTIALLY DOCUMENT - IT IS VALID - AS LONG AS THE PASSED DATA IS VALID!
// const updateTask = async(req,res,next) => {

//     try 
//     {
//         //third parameter - to return the new modified document - rather than original - by default set to false
//         //forth parameter - to re run the validator
//         const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
//             new:true,
//             runValidators:true    
//         })
//         console.log('UPDATED TASK: ', task)
        
//         res.status(201).json({
//             status:'success', 
//             data:{
//                 task
//             }
//         })

//     }
//     catch(err)
//     {
//         console.log(err.message)
//         res.status('404').json({
//             status:'fail',
//             message:err.message})

//     }

// }


exports.createTask = createTask ;
exports.getAllTasks = getAllTasks;
exports.findTaskById = findTaskById
exports.updateTask = updateTask;
exports.deleteTask = deleteTask





//BEFORE HANDLING ERRORS IN ASYNC FUNCTION
// const createTask = async(req,res) =>{ 
    
//     try
//     {
//         const newTask = await Task.create(req.body)

    

//         res.status(201).json({
//             status:'success', 
//             data:{
//                 task:newTask
//             }
//         })
//     }
//     //FOR NOW - SIMPLE ERROR HANDLING  - LATER ERROR HANDLING SECTION
//     catch(err)
//     {
//         console.log(err.message)
//         res.status(404).json({
//             status:'fail', 
//             message:err.message

//         })

//     }
  
//     // then-catch
//     // Task.create(req.body)
//     // .then(result => console.log(result))
//     // .catch(err => console.log(err.message))    
// }


// const findTaskById = async (req,res)=>{

//     try 
//     {

//         const task = await Task.findById(req.params.id)

//         console.log(task)

//         res.status(200).json({
//             status:'success', 
//             data:{
//                 task
//             }
//         })
//     }
//     catch(err)
//     {
//         console.log(err.message)
//         res.status('404').json({
//             status:'fail',
//             message:'fail'})

//     }
    
// }




// //REST - BEST PRACTICE - DONT SEND BACK TO THE CLIENT WHEN DELETE!
// const deleteTask = async (req,res,next)=>{

 
//     try 
//     {
//         const deletedTask = await Task.findByIdAndDelete(req.params.id)
//         //OK - IT WORKS!
//         //if(!deletedTask ) throw new Error('Could not delete!')
        
//         console.log(typeof(deletedTask))
        
//         console.log(deletedTask)

//         res.status(204).json({
//             status:'success', 
//             data:{
//                 deletedTask
//             }
//         })

//     }
//     catch(err)
//     {
//          console.log(err.message)

//             res.status('404').json({
//             status:'fail',
//             message:err.message})

//     }
  
// }
