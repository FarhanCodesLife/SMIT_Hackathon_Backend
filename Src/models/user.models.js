import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
    cnic: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^[0-9]{5}-[0-9]{7}-[0-9]$/.test(value);
            },  
            message: "Invalid CNIC format"

        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    
});

userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    user.password = await bcryptjs.hash(user.password, 10);
    next();
});

export default mongoose.model("User", userSchema);