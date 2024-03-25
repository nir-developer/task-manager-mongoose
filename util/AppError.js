

class AppError extends Error{
    
    constructor(message, statusCode)
    {
        //ON PROTOTYPE - OK!
         //expect(actual.__proto__).toHaveProperty('message') => TRUE
        super(message); 

        //NOT ON THE PROTOYPE OF THE INSTANCE!!!BUT ON THE INSTANCE
        //expect(actual.__proto__).toHaveProperty('status') => FALSE!! 
        this.statusCode = statusCode; 

        //Convert the number into a string using template string!
        this.status = `${statusCode}`//=> convert the number to string!
        .startsWith('4') ? 'fail': 'error'


        //SHOULD ALWAYS BE TRUE (unlike the bug errors )
        this.isOperational = true;  


        //WHEN A NEW OBJECT  - AppError  - IS CREATED and the constructor function is called 
        //THEN I DONT WANT TO DISPALY THE CALL TO THIS CONSTURCTOR FUNCTION
        Error.captureStackTrace(this, this.constructor)


    }
}

module.exports = AppError;