//NODE JS BUILD IN METHOD TO PROMISIFY CB BASED API 
const {promisify} = require('util'); 
const catchAsync = require('../util/catchAsync')
const User = require('../models/User')

const jwt = require('jsonwebtoken')
const AppError = require('../util/AppError')
//ENCRYPT THE PASSWORD IN THE MODEL - NOT IN THE CONTROLLER HERE!!! BUSSINESS LOGIC!
//const bcrypt = require('bcryptjs')


//HELPER  
const signToken = id => {
    return jwt.sign(
        //ES6 
         {id},
         process.env.JWT_SECRET ,
         {expiresIn:process.env.JWT_EXPIRES_IN}
         )
}
    

 //cookieOptions variable: 
    //CONFIGURE THE COOKIE THAT WILL BE CREATED AND ADDED TO THE RESPONSE 
    //NOTE:THE COOKIE WILL BE USED BY ANY CLIENT (browser or any..)
    //1)expires: =>  MUST DO THE CONVERSION MY SELF FROM NUMBER OF days to m.s(unlike the jsonwebtoken library that uses the 'd' in 90d!)
    //2)httpOnly:true => TO PREVENT CROSS-SITE-SCRIPTING ATTACKS!  JS CODE ON THE CLIENT WILL NOT BE ABLE TO ACCESS OR MODIFIED THIS COOKIE ON THE BROWSER!
    //3) secure:true => sent the cookie as secure(HTTPS euncrypted only on production)
const createSendToken = (user, statusCode, res) =>{
 

    /**TUTORIAL: 
     *     let options = {
        maxAge: 1000* 60 * 15 , //EXPIRES AFTER 15 mins 
        httpOnly:true,//COOKIE WILL NOT BE EXPOSED TO CLIENT SIDE CODE(PREVENT CSRF)
        sameOrigin:"none", //IF CLIENT AND SERVER ORIGIN ARE NOT THE SAME!
        //SO HOW IT WORKS WITH HTTPS??
        secure:true //USE WITH HTTPS ONLY 
    }
     */
    const token = signToken(user._id) 

    const cookieOptions = {
        expires:new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 10000 ), 
            httpOnly:true, 
            sameOrigin:"none"
    }


    if(process.env.NODE_ENV === 'production') 
        cookieOptions.secure = true;

    //Create the cookie with the configuration and the tokena as a value
    res.cookie('jwt', token, cookieOptions)

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })

}


exports.signup  = catchAsync(async (req,res,next)=>{

    //SECURITY FLOW! PREVENT ALL FIELDS TO BE PERSISTED (like role, etc..)
    // const newUser = await User.create(req.body)

     const newUser = await User.create({
        name:req.body.name, 
        email:req.body.email, 
        password: req.body.password, 
        passwordConfirm:req.body.passwordConfirm, 
        passwordChangedAt: req.body.passwordChangedAt
     })


     
     createSendToken(newUser, 201, res)

     ////////////////////////////////
     //REFACTOR THE CREATION AND SENDING THE TOKEN LOGIC TO THE createSendToken function !
    //  const token = signToken(newUser._id)
    
    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data:{
    //         user:newUser
    //     }
    // })
})


exports.login = catchAsync( async (req,res,next) =>{
    const {email, password} = req.body;

    //1) GOURD CLAUSE  - CHECK IF EMAIL AND PASSWORD EXISTS
    //MUST RETURN BEFORE CALLING NEXT!! OTHERWISE:ERROR Cannot set headers after they are sent to the client
    if(!email || !password)  return  next(new AppError('email and password are required!', 400))


   //2) CHECK IF USER EXISTS(BASED ON EMAIL)
    //SUPER IMPORTANT - RE-ENABLE THE password in the result set(only here since I need the password!)
    //(after setting the User model password{select:false}) - from being leaked to the client after signup! 
    //USE ES6 TO SHORT email:email
    //WITHOUT THE PASSWORD!!
    //const user = await User.findOne({email})
    //WITH THE PASSWORD - OK
   const user = await User.findOne({email}).select('+password')

//    console.log(user)
   
   //3) CHECK IF PASSWORD IS CORRECT - use the bcrypt package - by ENCRYPT the input password - and compare with the encrypted in db 
   //NOTE: can not get the old password from the encrypted in db ! the all point of hashing! 
   //Call the INSTANCE METHOD OF THE USER MODEL -  I defined for comparing the passwords (user input and hashed in the db)
   //NOTE: MOVE THIS LINE OF CODE TO THE IF!! SINCE IT WILL NOT BE EXECUTED IF THE LAST LINE THROW!!
   //const correct = await user.correctPassword(password, user.password)
   //DON'T LEAK WHICH FIELD  WAS INCORRECT !(EMAIL OR PASSWORD)
   if(!user || !(await user.correctPassword(password, user.password))) return next(new AppError('incorrect email or password', 401))

   ///OK - RETURN THE PASSWORD!
    //console.log(user); 

   //3) IF EVERYTHING IS OK : SEND THE TOKEN TO THE CLIENT
    const token = signToken(user._id)
    res.status(200).json({
        status:'success', 
        token
    })
})


//NOTE - THIS LOGIC IS NOT BUSINESS LOGIC(probably since implemented here in controller)
exports.protect = catchAsync(async(req,res,next) =>{

    //STEP 1) GET THE TOKEN FROM THE REQUEST - AND CHECK IF IT'S THERE 
    let token ; 
    if(req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1] 
    }
    
    //console.log(`token = ${token}`)

    //401: DATA SENT IN THE REQUEST IS CORRECT - BUT NOT ENOUGH TO GET ACCESS TO THE USER TO THE RESOURCE
    if(!token) return next(new AppError('You are not logged in! Please log in to get access', 401))


    //STEP 2) VERIFICATION: VALIDATE THE TOKEN :
        //- THAT NO ONE CHANGED THE PAYLOAD the userId for which the token was issued) )
        //- THAT THE TOKEN EXPIRATION DATE WAS NOT EXPIRE
    //IMPORTANT - PROMISIFY THE jwt.verify(token,secret, cb) !
    //CB BASED API: jwt.verify(token, process.env.JWT_SECRET, cb)
    //the resolved value of the promise is the decoded payload!
    //the promisify(jwt.verify) is a function! I NEED TO CALL IT 
    const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    //OK DECODED PAYLOAD : { id: '65e951beeae2a852cb451f5b', iat: 1709790628, exp: 1717566628 }
   // console.log(decoded)




    //=> AFTER STEP 1,2 - SINCE THE VERIFICATION PROCESS WAS SUCCESS
    // - I CAN BE SURE THAT THE ID IN THE PAYLOAD IS CORRECT! NO ONE MANIPULATE THE TOKEN !
    //THE USER FOR WHICH I ISSUED THE JWT - HAS THE ID IN THE JWT PAYLOAD!


    //3) CHECK IF USER STILL EXISTS! 
    //HANDLE THE 2 CASES :
        //1)  User has been deleted (and JWT is still valid)
        //2) someone stole the jwt of the user and the user updated the password against 
        //in case 2  - I should devalidate the old JWT 

    
    //HANDLE CASE 1: 
    //fresh user - not a new one! 
    const currentUser = await  User.findById(decoded.id)
    if(!currentUser) return next(new AppError('The user belonging to the token does no longer exist', 401))


    //4) CHECK IF USER CHANGED PASSWORD - AFTER TOKEN WAS ISSUED - return an error
    if(currentUser.changedPasswordAfter(decoded.iat)) 
    {

        return next(new AppError('User recently changed password! Please log in again.', 401))

    }


    //CONTINUE TO THE NEXT M.W THAT ACCESS THE PROTECTED DATA- TASKS! 
    //GRANT ACCESS TO PROTECTED ROUTE!

    //PUT THE ENTIRE USER DATA ON THE REQUEST FOR LATER M.W HANDLING FOR AUTH 
    req.user = currentUser; 

    next(); 

})


//WRAPPER FUNCTION THAT RETURNS THE M.W I WANT!
//CLOSURE:  THIS return  M.W HAS ACCESS TO THE roles REST PARAMETER
// example of roles and current user :['admin','user'], req.user.role='user'
//req.user variable is available since it  has been created by the previous m.w - protect
exports.restrictTo = (...roles) => {

    return (req,res,next) =>{
        console.log(`username: ${req.user.name}`)
        console.log(`user's role: ${req.user.role}`)
        console.log(`roles param`, roles)

        if(!roles.includes(req.user.role))
            return next(new AppError('You do not have a permission to perform this action', 403))

        next(); 
    }
   

}





