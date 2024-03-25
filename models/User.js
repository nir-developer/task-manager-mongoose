const mongoose = require('mongoose')
const validator = require('validator') 
const bcrypt = require('bcryptjs')
const userSchema = mongoose.Schema({
    name:{
        type:String, 
        required:[true ,'Please tell us your name']
    },
    email:{
        type:String, 
        required:[true, 'Please provide your email'],
        unique:true, 
        //not a validator - but simply convert to lowercase 
        lowercase:true, 
        validate:[validator.isEmail,'Please provide a valid email'], 
    },
     photo:String, 
     role:{
        type:String, 
        //SPECIFIC TO APP DOMAIN(change in each app )
        enum:['user', 'admin'], 
        default:'user'

     },
     password:{
        type:String, 
        required:[true, 'Please provide a password'], 
        minlength:8, 
        //FOR SECURITY - PREVENT DISPLAYING THE PASSWORD IN ANY OUTPUT OF THE USERS FROM THE DB  
        select:false
     },
     passwordConfirm:{
        type:String, 
        required:[true, 'Please confirm your password'], 
        //CUSTOM VALIDATOR  - ONLY WORKS ON SAVE OR CREATE!!!(not on findOneAndUpdate , etc...)
        validate:{
            //CAN NOT USE ARROW - SINCE NEED THE THIS KEYWORD
            validator: function(el){
                return el === this.password
            }, 
            message:'Password are not the same'
        }
     }
     ,
     passwordChangedAt:Date 
})

/**IMPORTANT : PASSWORD HASHING ->  BUSINESS LOGIC - HERE IN THE MODEL! - NOT IN CONTROLLER!
    - GOURD CLAUSE:MONGOOSE instance method: isModified() : 
             UPDATE ONLY IF THE PASSWORD OF THE CURRENT DOCUMENT(THIS) IS NEW OR UPDATED UPDATED 
    - GENERATING THE SALT VALUE FOR THE  HASH PASSWORDS (ASYNC VERSION!): 2 WAYS:
        - FIRST OPTION: Manually generate the salt - a random string that will be added to the password 
         -SECOND OPTION (EASIER): SPECIFY THE COST VALUE( CPU INTENSIVE) 
   
    - PREVENT A FILED OF THE MODEL TO BE PERSISTED IN THE DB: SET TO UNDEFINED
         NOTE:(validation of required : is only for the input to the model - not for the)

 */
userSchema.pre('save', async function(next) {


    if(!this.isModified('password')) return next();


    this.password = await bcrypt.hash(this.password, 12); 

    //prevent persistent to db
    this.passwordConfirm = undefined; 

    next(); 

})


//INSTANCE METHOD: will be available on all Documents of a certain collection 
//NOTE:I MUST PASS THE userPassword as param -  SINCE I SET THE password:{,...,select:false } then the password is not available in the output - then this.password is impossible!
//NOTE: the canidatePassword was hashed by the controller before it pass it to this method 
userSchema.methods.correctPassword = async function(candidatePassword, userPassword)
{
    return await  bcrypt.compare(candidatePassword, userPassword)

}

//JWT VERIFICATION(STEP 4  IN THE SECOND STEP OF AUTHENTICATION WORKFLOW)
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {

    
    //  console.log('INSIDE instance method of User - changedPasswordAfter: ')
    //  console.log(JWTTimeStamp)
    if(this.passwordChangedAt)
    {
       
        //GET THE TIMESTAMP  OF passwordChangedAt TO COMPARE WITH JWT !(base 10)
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

        
        //console.log(changedTimestamp, JWTTimeStamp)

        //demo: jwt issued at time 100  , and password updated at time 200 => RETURN TRUE - SINCE USER CHANGED THE PASSWORD AFTER JWT ISSUED
        
        return JWTTimeStamp < changedTimestamp


    }
    //THE DEFAULT VALUE TO RETURN - FALSE -> USER HAS NOT CHANGE THE PASSWORD AFTER JWT ISSUED!
    return false; 

}

 const User  = new mongoose.model('User', userSchema)
//const User = new model('User', userSchema)
module.exports = User;


