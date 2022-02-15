const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const { authSignUp, authLogin } = require('../validations/user.validate');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');


exports.GenerateOtp = () => {
	var otp = Math.random();
	otp = otp * 1000000;
	otp = parseInt(otp);
	console.log(otp);
	return otp;
}

var transport = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: "emsproject44@gmail.com",
		pass: "Awahab123@",
	},
});

exports.signUp = async (req, res) => {

	// JOI STARTS HERE
	// const { error, value } = authSignUp.validate(req.body); //JOI here validating
	// if (error) {
	// 	return res.json({
	// 		message: error.message
	// 	});
	// }
	// JOI ENDS HERE
	User.find({ email: req.body.email })
		.exec()
		.then((user) => {

			if (user.length >= 1) {
				return res.status(409).json({
					message: 'Email Already Exist !',
				});
			}
			// Validating User
			if (!req.body) {
				return res.status(400).send({
					message: 'Please Enter Some Data',
				});
			} else {
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {
						return res.status(500).json({
							error: err,
						});
					} else {
						// 
						const emailtoken = jwt.sign(
							{
								email: req.body.email,
								user_name: req.body.name,
								password: hash
							},
							"secret",
							{
								expiresIn: '5h',
							}
						);

						transport.sendMail({
							from: '"Auth System" emsproject44@gmail.com',
							to: req.body.email,
							subject: "Please confirm your account",
							html: `<div>
								<h1>Email Confirmation</h1>
								<h2>Hello ${req.body.name}</h2>
								<p>Thank you for Registration. Please confirm your email copy this token and send it back to confirm verification</p>
								<p> ${emailtoken}</p>
								</div>`,
						}).catch(err => console.log(err));
						//
					}

				});
			}
			return res.status(201).json({

				message: "Successfully Registered!!"
			});
		}).catch(err => console.log(err));
};
// Sign Up End Here

exports.logIn = async (req, res) => {
	// JOI STARTS HERE
	// const { error, value } = authLogin.validate(req.body); //JOI here validating
	// if (error) {
	// 	return res.json({
	// 		message: error.message,
	// 	});
	// }
	// JOI ENDS HERE

	User.find({ email: req.body.email })
		.exec()
		.then((user) => {
			if (user.length < 1) {
				return res.status(404).json({
					message: 'No Email Found !',
				});
			}
			bcrypt.compare(req.body.password, user[0].password, (err, result) => {
				if (err) {
					return res.status(401).json({
						message: 'Login Failed',
					});
				}
				if (result) {
					if (user[0].email_Verified) {
						//console.log("otp = ", OTP)
						if(user[0].otp.length<3){
							const otp = this.GenerateOtp()
							user[0].otp.push(otp);
							user[0].save();
						}else{
							return res.status(401).json({
								message: 'OTP Limmit reached contact vendor',
							});
						}
						
						const token = jwt.sign(
							{
								email: user[0].email,
								user_id: user[0].id,
							},
							"secret",
							{
								expiresIn: '5h',
							}
						);

						const token2 = jwt.sign(
							{
								otp: user[0].otp,
								email: user[0].email,
								user_id: user[0].id,
							},
							"secret",
							{
								expiresIn: '5h',
							}
						);
						transport.sendMail({
							from: '"Auth System" emsproject44@gmail.com',
							to: req.body.email,
							subject: "Please confirm your account",
							html: `<div>
							<h1>Email Confirmation</h1>
							<h2>Hello ${req.body.name}</h2>
							<p>Thank you for Registration. Please confirm your email copy this token and send it back to confirm verification</p>
							<p> ${token2}</p>
							</div>`,
						}).catch(err => console.log(err));
						return res.status(200).json({
							message: 'Use OTP SENT TO YOUR EMAIL FOR LOGIN !!!',
							token: token,
						});
					}
				}
				return res.status(401).json({
					message: 'Auth Failed',
				});
				//	
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
};

exports.verifyToken = async (req, res, next) => {
	try {
		const { token } = req.body;
		console.log(token);
		const { email } = jwt.verify(
			token,
			"secret",
		);
		console.log(email)
		const user = await User.find({ email: email });
		console.log(user)
		if (user) {
			const { name, email, _id } = user[0];
			return res.status(200).json({
				user_id: _id,
				name,
				email,
				token,
			});
		}
		throw new Error('Something went wrong');
	} catch (error) {
		res.status(500).json({
			message: 'Something went wrong,please try again later',
		});
	}
};

exports.emailVerified = async (req, res, next) => {
	try {
		const { token } = req.body;
		console.log(token);
		const { email, user_name, password } = jwt.verify(
			token,
			"secret",
		);
		console.log(email)
		const user = new User({
			_id: mongoose.Types.ObjectId(),
			name: user_name,
			email: email,
			password: password,
			email_Verified: true
		});
		user.save()
			// .select(' email password')
			.then((result) => {
				res.status(201).json({
					result,
					message: "Successfully Registered!!"
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					error: err,
				});
			});
		// const user = await User.findOne({email:email});
		// console.log(user)
		// if (user) {
		// 	console.log("wahab")
		// 	user.name=user_name;
		// 	user.email=email;
		// 	user.password=password;
		// 	user.email_Verified=true;
		// 	console.log("wahab")
		// 	await user.save();
		// 	console.log("wahab",user.email_Verified)
		// 	return res.status(200).json({
		// 		email,
		// 		user_name
		// 	});
		// }
		// throw new Error('Something went wrong');
	} catch (error) {
		res.status(500).json({
			message: 'Something went wrong,please try again later',
		});
	}
};

exports.verifyOTP = async (req, res, next) => {
	try {
		const { token } = req.body;
		console.log(token);
		const { otp, email, user_id } = jwt.verify(
			token,
			"secret",
		);
		console.log(otp.slice(-1))
		const user = await User.findById(user_id);
		if (user) {
			console.log("otp",user.otp)
			if (user.otp.pop() === otp.pop()) {
				const { name, email } = user;
				return res.status(200).json({
					message: "Login Successfully",
					user_id,
					name,
					email,
				});
			} else {
				return res.status(200).json({
					message: "OTP not verified contact vendor"
				});
			}
		}
		throw new Error('Something went wrong');
	} catch (error) {
		res.status(500).json({
			message: 'Something went wrong,please try again later',
		});
	}
};