import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        minlength: 6,
        maxlength: 20,
        unique: true
    },
    email: {
        type: String,
        require: true,
        minlength: 10,
        maxlength: 50,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minlength: 6,
    },
    gender: {
        type: String,
        require: true
    },
    birthday: {
        type: Date,
        require: true
    }
}, { timestamps: true }
)

const clientModel = mongoose.models.client || mongoose.model("client", clientSchema)

export default clientModel