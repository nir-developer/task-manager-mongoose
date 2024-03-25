
import { describe, it, expect } from "vitest";

import AppError from "./AppError.js";


describe('AppError Class Test Suite', ()=>{

    it('should contain all provided data when created', ()=>{

        const testMessage = 'Forbidden';
        const testStatusCode= 403;

  
      
        const actual = new AppError(testMessage, testStatusCode)

          expect(actual.message).toBe('Forbidden')
          //ON THE PROTOTYPE!!!
          expect(actual).toHaveProperty('message')
          
          //NOT ON THE PROTOTYPE - BUT ON THE INSTANCES
          expect(actual.statusCode).toBe(403)
          expect(actual.status).toBe('fail')
          expect(actual.isOperational).toBe(true)

      

    })
})





class Animal {


}

class Dog extends Animal{



}


//ADD
Object.defineProperty(Dog.prototype, 'name', {
    value:'CastError'
})

it.only('prototype of an object returned by destructuring an object of subclass',() => {

    const animal = new Animal(); 
    const dog = new Dog(); 
    const dogCopy = {...dog}


 
    console.log(animal.constructor.name) //=> Animal
    console.log(dog.constructor.name) //=> Dog 
    console.log(dogCopy.constructor.name) //=> Object


})


