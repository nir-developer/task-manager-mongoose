console.log('HELLO WORLD')

const API_BASE_URL = 'http://localhost:3000/api/v1'
const getAllTasks = (...filters) => {

    //CREATE FILTERS
    // if(filters && filters.length)  
    // {


    // }
    return fetch(`${API_BASE_URL}/tasks?sort=-priority`) 
    .then(res => res.json()) 
    .then(tasks => console.log(tasks))
    .catch(err => console.log(err.message))
}


getAllTasks()

