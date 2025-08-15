import bcrypt from "bcrypt";

const hashPassword = async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
}

const verifyPassword = async function (password) {
    if (!password) throw new Error("Password is required");

    return await bcrypt.compare(password, this.password);
}

export { hashPassword, verifyPassword };
