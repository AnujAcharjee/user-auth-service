import otpGenerator from 'otp-generator'

export const generateOTP = () => {
    return otpGenerator.generate(6, {
        alphabets: false,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    });
};