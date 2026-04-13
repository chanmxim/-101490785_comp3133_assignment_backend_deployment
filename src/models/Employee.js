import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },

    last_name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    salary: {
        type: Number,
        required: true,
        min: 0
    },
    date_of_joining: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    employee_photo: {
        type: String
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee