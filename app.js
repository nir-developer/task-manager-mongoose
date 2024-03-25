
const express = require('express')

//CORS
const cors = require('cors')
//CORS!! THATS IT!!!!!(client outside the project !!)


const taskRouter = require('./routes/taskRoutes')
//BOTH AUTH ENDPOINTS(NOT REST ENDPOINTS) && ADMIN REST ENDPOINTS
const userRouter = require('./routes/userRoutes')


//TO VIEW THE COOKIES SENT BACK FROM THE CLIENT(ALSO FROM THE BROWSER WITHTHE CLIENT APP!)
const cookieParser = require('cookie-parser')




const app = express();



//CORS TUTORIAL: SINCE DOES NOT WORK WHEN USING HTTPOnly - WITH MY JS VANILLA CLIENT!
//BUT NOW IT WORKS!!! 
const corsOptions = {
    //CONFIGURE TO PARCEL URL SERVER OF THE CLIENT - 1234 !
    origin:"http://localhost:5173" ,
   // origin:"*",
    credentials:true 
}
app.use(cors(corsOptions)) 

/////////////////////////////////////////////////
//JONAS CORS - DOES NOT WORK WITH MY  JS CLIENT VANILLA WITH COOKIES
// app.use(cors())
//app.options('*')
// app.options('*', cors())
//CORS - JONAS
// app.use(cors())
// app.options('*')




const morgan = require('morgan')



const AppError = require('./util/AppError')
const globalErrorHandler  = require('./controllers/errorController')



//PARSE DATA FROM THE REQUEST BODY
app.use(express.json())
//PARSE DATA FROM THE REQUEST COOKIES
app.use(cookieParser())
app.use(express.static('public'))



app.use((req,res,next) =>{ 
    req.requestTime = new Date().toISOString(); 
   
    console.log(`Request Time: ${req.requestTime}`)
    //PRINT THE JWT IN THE HTTP ONLY COOKIE SENT BY THE CLIENT
    console.log(req.cookies)
    // console.log(`Request headers`, req.headers)
    // console.log(`token = ${req.headers.authorization}`)
    next(); 
})


if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'))
}


 app.use('/api/v1/tasks', taskRouter)
 app.use('/api/v1/users', userRouter)
 app.all('*',(req,res,next) =>{
      next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
     } 
    )
        

//EXPRESS GLOBAL ERROR HANDLER!
app.use(globalErrorHandler)


module.exports = app; 
