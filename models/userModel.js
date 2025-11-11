import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    refreshToken: {
        type: String,
        default: null
    },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        console.error("User Model Pre Error", error);
        next(error);
    }
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", userSchema);

export default User