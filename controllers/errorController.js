
 //NO!!!!!!!!!!!!!! NO NEXT() ANYMORE - THIS IS THE  LAST M.W!!!!!
  // next(err) 

  const AppError = require('../util/AppError')

  //OPERATIONAL ERROR 1- I NEED TO HANDLE - THROWN BY  MONGOOSE
  /**IMPORTANT: the path property in the response is the name of
       the field for which the input value is in the wrong format 
   */
  const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)

}


//OPERATIONAL ERROR 2 -   I NEED TO HANDLE - THROWN BY MONGOD DRIVER(NOT MONGOOSE)
//REGEX: GRABBING VALUES BETWEEN QUOTATION MARKS !
//Extract the value from the error.msg property : https://stackoverflow.com/questions/171480/regex-grabbing-values-between-quotation-marks
const handleDuplicateField = err => {
  
  const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0]
  console.log(value)

  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}



//OPERATION ERROR 3 - I NEED TO HANDLE ALL MONGOOSE VALIDATION ERRORS
//BY LOOPING THROUGH THE PROPERTIES OF err.errors OBJECT OF the err 
//AND EXTRACT ONE STRING
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  console.log(errors)

  ///JOIN THE STRINGS MESSAGES -  IN THE errors array  - into one STRING message
  const message = `Invalid input data.${errors.join('. ')}` 
  return new AppError(message, 400)
}


//401 - UNAUTHORIZED : DATA IN REQUEST  IS OK BUT NOT ENOUGH TO GET ACCESS TO RESOURCE
const handleJWTError = () => new AppError('Invalid token. Please log in again', 401)


const handleJWTExpiredError = err => new AppError('Your token has expired! Please login in again', 401)

  const sendErrorDev = (err,res) =>
  {
        res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack
             })
       
  }


  const sendErrorProd = (err,res)=>{
         //OPERATIONAL - TRUSTED ERRORS: SEND  MESSAGE TO CLIENT
        //Operational  + Development => SEND AS MUCH AS POSSIBLE DATA ABOUT THE ERROR DETAILS
        if(err.isOperational)
        {
          res.status(err.statusCode).json({
          status:err.status,
          message:err.message
        })
        }
        //PROGRAMMING OR OTHER UNKOWN ERROR: DONT LEAK ERROR DETAILS TO THE CLIENT
        //Programming/Bugs Errors + Dev => send generic error + 500
        else 
        {
          console.error('ERROR**' ,err)
          res.status(500).json({
          status:"error", 
          message:"Something went very wrong!"

          })
        }
        
  }


module.exports = (err, req,res,next) => {

        //500 for non operational error (bugs) 
        err.statusCode = err.statusCode || 500; 
        err.status = err.status || 'error'

        if(process.env.NODE_ENV === 'development')
        {
                
                sendErrorDev(err,res)
        }

        else if(process.env.NODE_ENV === 'production')
        {

          //SUPER IMPORTANT!!
           //let error = {...err};
           //MUST ADD THE name and message property - since they are not on the copy object !!!
          /** COPY OBJECT RETURNED BY DESTRUCTURING - DOES NOT PRESERVE SOME PROPERTIES OF ORIGINAL ONE!!
           * let error = { ...err };
            console.log(`error.code of copy object = ${error.code}`)
           console.log(`error.name of copy object = ${error.name}`)
            console.log(`error.message of copy object = ${error.message}`)
           * error.code of copy object = 11000
            error.name of copy object = undefined
            error.message of copy object = undefined
           */


          //CORRECT WAY!! 
          let error = {...err, name:err.name, message:err.message, errors:err.errors}
          // console.log(`error.code of copy object = ${error.code}`)
          // console.log(`error.name of copy object = ${error.name}`)
          // console.log(`error.message of copy object = ${error.message}`)

          // console.log(`err.errors of copy : ${error.errors}`)

           //invalid id  - thrown by Mongoose -> has the error.name property ( error.name ='CastError' )
           if(error.name === 'CastError') error = handleCastErrorDB(error); 
          
           //duplicate error is thrown by MongodDriver(not by Mongoose )-> it does not have the error.name 
          if(error.code === 11000) error = handleDuplicateField(error)



          //Handle Mongoose Validation Error
          if(error.name === 'ValidationError') error = handleValidationErrorDB(error)

          if(error.name === 'JsonWebTokenError') error = handleJWTError(error)

          if(error.name = 'TokenExpiredError') error = handleJWTExpiredError(error)

           sendErrorProd(error,res)

        }

         
        

    }

    