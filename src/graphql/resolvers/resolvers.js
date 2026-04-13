import User from "../../models/User.js"
import Employee from "../../models/Employee.js"

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const resolvers = {
    Query: {
        login: async (_, {usernameOrEmail, password}) => {
            const user = await User.findOne({
                $or: [{email: usernameOrEmail}, {username: usernameOrEmail}]
            });
            if (!user) {
                throw new Error("User not found")
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid){
                throw new Error("Invalid credentials")
            } 
            
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    username: user.username
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

            return {
                user,
                token
            };
        },

        getAllEmployees: async (_, __, context) => {
            if (!context.user) throw new Error("Access Denied: You must be logged in.");

            return await Employee.find({})
        },

        searchEmployeeByEid: async (_, {id}, context) => {
            if (!context.user) throw new Error("Access Denied: You must be logged in.");

            const employee = await Employee.findById(id);
            if (!employee){
                throw new Error("Employee not found")
            }

            return employee
        },

        searchEmployeeByDesignationOrDepartment: async (_, {designation, department}, context) => {
            if (!context.user) throw new Error("Access Denied: You must be logged in.");

            return await Employee.find({
                $or: [
                    { designation: designation || { $exists: true } },
                    { department: department || { $exists: true } }
                ]
            });
        }
    },

    Mutation: {
        signup: async (_, {username, email, password}) => {
            try {
                const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10)
                const hashedPassword = await bcrypt.hash(password, salt);

                const newUser = new User({username, email, password: hashedPassword})
                const savedUser = await newUser.save()
                
                const token = jwt.sign(
                {
                    userId: savedUser.id,
                    email: savedUser.email,
                    username: savedUser.username
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

                return {
                    user: savedUser,
                    token
                }

            } catch(e){
                throw new Error(e.message)
            }
        },

        addNewEmployee: async (_, args, context) => {
            if (!context.user) throw new Error("Access Denied: You must be logged in.");

            try {
                const newEmployee = new Employee(args)
                const savedEmployee = await newEmployee.save()

                return savedEmployee

            } catch(e){
                throw new Error(e.message)
            }
        },

        updateEmployeeByEid: async (_, args, context) => {
            if (!context.user) throw new Error("Access Denied: You must be logged in.");

            const {id, ...updateData} = args

            try{
                const updatedEmployee = await Employee.findByIdAndUpdate(
                    id,
                    updateData,
                    {new: true, runValidators: true}
                )
                if (!updatedEmployee){
                    throw new Error("Employee not found")
                }

                return updatedEmployee

            } catch(e){
                throw new Error(e.message)
            }
        },

        deleteEmployeeByEid: async (_, {id}, context) => {
            if (!context.user) throw new Error("Access Denied: You must be logged in.");

            const deleted = await Employee.findByIdAndDelete(id)
            if (!deleted){
                throw new Error("Employee not found")
            }

            return "Employee deleted"
        }
    }
}

export default resolvers