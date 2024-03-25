const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})

//CATCH UNCAUGHT EXCEPTIONS(ERROR(NOT EXCEPTIONS) = BUGS = Uncaught Exception ) - SYNC ERRORS
//START TO LISTEN TO uncaughtExceptions(ERRORS=BUGS) - BEFORE require the app
process.on('uncaughtException', err => {

    //OUTPUT ONLY THE NAME AND MESSAGE 
    //-AS OPPOSED TO THE HANDLING OF REJECTED PROMISES BEFORE which I want to print the entire stack
    console.log('***MY UNCAUGHT EXCEPTION(=ERRORS=BUGS) ****\nSHUTTING DOWN....')
    console.log(err.name, err.message)
    //NO NEED THIS - SINCE THE UNCAUGHT ERRORS - DONT OCCUR ASYNC ANYWAY! - HAS NOTHING TO DO WITH THE server
    // server.close(() => {

    //     process.exit(1); 
    // }); 
}) 


const mongoose = require('mongoose')

const app = require('./app');


console.log(`run in ${process.env.NODE_ENV} mode`)
//`mongodb+srv://nir:${process.env.DB_PASSWORD}@cluster0.3ftrnwy.mongodb.net/task-manager?retryWrites=true`
//ATLAS - use when there is internet
const DB = 
    process.env.NODE_ENV === 'compass' ? 
    process.env.DB_COMPASS: process.env.DB_ATLAS
    


console.log(`current db: ${DB}`)



//DB SERVER
//mongoose.connect(`mongodb+srv://nir:${process.env.DB_PASSWORD}@cluster0.3ftrnwy.mongodb.net/task-manager?retryWrites=true`)
mongoose.connect(DB)
.then(() => {
    console.log('CONNECTED TO MONGODB WITH MONGOOSE')

})
//INSTEAD OF CATCHING THIS ERROR - HERE LOCALLY - CATCH IT AS BELOW - WITH PROCESS!!
// .catch(err => {
//     console.log(err)})



//WEB-SERVER
const PORT = process.env.PORT || 3000 ; 
const server = app.listen(PORT, () =>{ 
    console.log(`task-manager-mongoose api running at http://localhost:${PORT}/api/v1/`)
})




//(OPERATIONAL ERRORS - OUTSIDE OF EXPRESS! - BUT IN DB - no connection)
//GLOBAL HANDLE UNHANDLED REJECTED PROMISE('SAFETY NET') 
//BY LISTENING TO THE unhandledRejection event 
//emitted by the process object 
//NOTE: IN PRODUCTION - I SHOULD HAVE A TOOL THAT RESTART THE SERVER AFTER THE APP CRASHED!(or it is done by the cloud provider by default!)
process.on('unhandledRejection', err => {
    console.log(err)
    console.log('***MY CATCH UNHANDLED REJECTION PROMISE****\nSHUTTING DOWN....')
    //SHUT DOWN THE APPLICATION - (GRACEFULLY) 
    //GRACEFULLY: (server.close()) : LET SERVER  FINISH HANDLING ALL PENDING REQUEST
    server.close(() => {
     //SINCE NO DB CONNECTION 
        //NOTE: STATUS CODE 1: unhandled error !
        //SHUT DOWN THE SERVER ONLY NOW - AFTER GRACEFULLY CLOSE THE SERVER
        process.exit(1); 
    }); 
})






//DEMO OF UNCAUGHT EXCEPTION: (BUG = ERROR) IN SYNC CODE







