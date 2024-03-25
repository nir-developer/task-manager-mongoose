 
const catchAsync =  fn => {

    //console.log('catchAsync called')
    //fn is an async function => it returns a promise -> can use catch on it
    return (req,res,next) => {
        fn(req,res,next) //PROMISE
        .catch(next)//REJECTED PROMISE - CATCH IT!
    
    }
}


module.exports = catchAsync;