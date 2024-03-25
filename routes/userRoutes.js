const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const express = require('express')
const router = express.Router(); 

//NOT A REST ENDPOINT(NOT A RESOURCE)
router.post('/signup', authController.signup); 
router.post('/login', authController.login)


//COMPLETE USER ROUTES FOR REST RESOURCES - FOR ADMING OPERATION!!!!!!
router 
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)


router 
    .route('/:id')
    .get(userController.findUserById)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router;