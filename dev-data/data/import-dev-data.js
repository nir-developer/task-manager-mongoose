
//DONT STARTS THE EXPRESS APP -> dont import app.js ! 
const fs = require('fs')
const path = require('path')

const rootDir = path.join(process.cwd()) 


const dotenv = require('dotenv')
dotenv.config({path:path.join(rootDir, 'config.env')})



const mongoose= require('mongoose') //FOR CREATING THE CONNECTION!
const Task = require('../../models/Task')


const DB = process.env.DB_ATLAS; 

//CONNECT TO DB  - TOP LEVEL!
mongoose
.connect(DB) 
.then(() => console.log(`DB connection successful!`))
.catch(err => console.log(err.message))


const tasks = JSON.parse(fs.readFileSync(path.join(rootDir, 'dev-data', 'data', 'tasks.json')))

console.log(tasks)

const option = process.argv[2]
console.log(option)

async function importData()
{
    try 
    {
      const result =  await Task.create(tasks)
       console.log('SUCCESS ADDED TASKS FROM JSON TO DB!!')

    }
    catch(err)
    {
        console.log(err.message)
    }

    process.exit(); 

}


async function deleteData() 
{
    try 
     {  
        await Task.deleteMany(); 

        console.log('SUCCESS DELETED ALL TASKS FROM DB')


     }

     catch(err)
     {
        console.log(err.message)

     }
     process.exit(); 
}




if(process.argv[2] === '--import')
{
    importData(); 
    
}
else if(option === '--delete')
{
    deleteData() ;
}



// else if(process.argv[2] === '--delete')
// {
//     console.log('delete...')
// }


