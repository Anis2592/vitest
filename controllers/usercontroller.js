import User from '../models/Employee.js';
import Joi from 'joi';
import mongoose from 'mongoose';
 
const userValidationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'any.required': 'Name is required'
    }),

  cellphone1: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Cellphone1 must be a valid number with 10-15 digits'
    }),

  cellphone2: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Cellphone2 must be a valid number with 10-15 digits'
    }),

  homenumber: Joi.string()
    .pattern(/^[0-9]{6,15}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Home number must be a valid number'
    }),

  address: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.max': 'Address can be up to 255 characters long'
    }),

  city: Joi.string()
    .max(30)
   .required()
   .label('city'),

  state: Joi.string()
    .max(30)
    .required()
    .label('state'),

  emailid: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be valid',
      'any.required': 'Email is required'
    }),

  jobTitle: Joi.string()
    .max(100)
    .required()
    .label('jobTitle'),

  paymentMethod: Joi.string()
    .valid('Cash', 'Bank Transfer', 'Cheque', 'UPI')  
    .required()
    .messages({
      'any.only': 'Payment method must be one of Cash, Bank Transfer, Cheque, or UPI'
    }),

  dateOfBirth: Joi.date()
    .less('now')
    .allow(null)
    .messages({
      'date.less': 'Date of birth must be in the past'
    }),

  dateOfJoining: Joi.date()
    .less('now')
    .allow(null)
    .messages({
      'date.less': 'Date of joining must be in the past'
    }),

    languages: Joi.array().items(Joi.string()).required().messages({
      'array.base': 'Languages must be an array of strings',
    }),
    

  ofPaidVacationDaysAllowed: Joi.number()
    .min(0)
    .max(365)
    .allow(null)
    .messages({
      'number.base': 'Paid vacation days must be a number',
      'number.min': 'Paid vacation days cannot be negative',
      'number.max': 'Too many paid vacation days'
    }),

  ofPaidSickVacationAllowed: Joi.number()
    .min(0)
    .max(365)
    .allow(null)
    .label('ofPaidSickVacationAllowed')
    .messages({
      'number.base': 'Paid sick days must be a number',
      'number.min': 'Paid sick days cannot be negative',
      'number.max': 'Too many paid sick days'
    }),

  employeeStatus: Joi.string()
    .valid('Active', 'Inactive', 'Terminated', '')
    .required()
    .label('employeeStatus')
    .messages({
      'any.only': 'Employee status must be Active, Inactive, or Terminated'
    })
});

// Create new user
export const createUser = async (req, res) => {
  try {
    console.log("Received Data", req.body);

    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Validation failed", error: error.details[0].message });
    }

    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json({ message: "User added successfully!", user: savedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving user data", error });
  }
};

// Get user by ID

export const getUserById = async (req, res) => {
  const { id } = req.params;

  // Validate Mongo ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user data',error: err.message });
  }
};
 
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving users", error });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Validation failed", error: error.details[0].message });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated!", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};


// import User from '../models/Employee.js';

// export const createUser= async (req, res) => {
//  try {
//        console.log("Recevived Data",req.body);
//     const newUser = new User({
//        name: req.body.name,
//        cellphone1: req.body.cellphone1,
//        cellphone2: req.body.cellphone2,
//        homenumber: req.body.homenumber,
//        address: req.body.address,
//        city: req.body.city,
//        state: req.body.state,
//        emailid: req.body.emailid,
//        jobTitle: req.body.jobTitle,
//        paymentMethod: req.body.paymentMethod,
//        dateOfBirth: req.body.dateOfBirth,
//        dateOfJoining: req.body.dateOfJoining,
//        languages: req.body.languages,
//        ofPaidVacationDaysAllowed: req.body.ofPaidVacationDaysAllowed,
//        ofPaidSickVacationAllowed: req.body.ofPaidSickVacationAllowed,
//        employeeStatus: req.body.employeeStatus
//      });

    
//      const savedUser = await newUser.save();
//      res.status(201).json({ message: "User added successfully!", user: savedUser });

//    } catch (error) {
//      console.error(error);
//      res.status(500).json({ message: "Error saving user data", error });
//    }
// };


// export const getUserById = async (req, res) => {
//     try {
//        const user = await User.findById(req.params.id); 
//        if (!user) {
//          return res.status(404).json({ message: "User not found" });
//        }
//        res.status(200).json(user);
//      } catch (error) {
//        console.error(error);
//        res.status(500).json({ message: "Error retrieving user data", error });
//      }
//   };
   

//  export const getAllUsers = async (req, res) => {
//      try {
//          const users = await User.find();
//        res.status(200).json(users);
//      } catch (error) {
//        console.error(error);
//        res.status(500).json({ message: "Error retrieving user data", error });
//      }
//   };
// export const updateUser = async (req, res) => {
//    const updateduser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
//    res.json({ message: "User updated!", users: updateduser });
//  };


// export const deleteUser = async (req, res) => {
//    await User.findByIdAndDelete(req.params.id);
//    res.json({ message: "user deleted!" });
//  };
 
