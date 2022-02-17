const User = require('../model/user');
const Otp = require('../model/otp');
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
exports.GenerateToken = (data) => {
	const token = jwt.sign(
		data,
		"secret",
		{
			expiresIn: '5h',
		}
	);
	return token;
}

exports.sendEmail = (data) => {
	const token = this.GenerateToken(data);
	transport.sendMail({
		from: '"Auth System" emsproject44@gmail.com',
		to: data.email,
		subject: "Please confirm your account",
		html: `<div>
			<h1>Email Confirmation</h1>
			<h2>Hello ${data.name}</h2>
			<p>Thank you for Registration. Please confirm your email copy this token and send it back to confirm verification</p>
			<p> ${token}</p>
			</div>`,
	}).catch(err => console.log(err));

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
	const userOtp =await Otp.find({ email: req.body.email });
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
						//const userOtp = Otp.find({ email: req.body.email });
						console.log("userotp",userOtp[0])
						if (userOtp[0]) {
							console.log(userOtp[0])
							if (userOtp[0].otp.length < 3) {
								const otp = this.GenerateOtp();
								userOtp[0].otp.push(otp);
								userOtp[0].save();
								const data = {
									email: req.body.email,
									password: hash,
									name: req.body.name,
									otp: otp
								}
								this.sendEmail(data);
								return res.status(202).json({
									message:"OTP generated"
								});
							} else {
								return res.status(501).json({
									message: "OTP limit Reached contact vender!!"
								});
							}
						} else {
							const otp = this.GenerateOtp();
							const userOtp = new Otp({
								_id: mongoose.Types.ObjectId(),
								email: req.body.email,
								otp: otp
							});
							userOtp.save()
								// .select(' email password')
								.then((result) => {
									const data = {
										email: result.email,
										password: hash,
										name: req.body.name,
										otp: result.otp,
									}
									this.sendEmail(data)
									res.status(200).json({
										result,
										message: "OTP generated !!"
									});
								})
								.catch((err) => {
									console.log(err);
									res.status(502).json({
										error: err,
									});
								});
						}
						// 
						//
					}

				});
			}
			// return res.status(201).json({

			// 	message: "Successfully Registered!!"
			// });
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

exports.regenerateOtp = async (req, res, next) => {
	try {
		const { email, password, name } = req.body;

		console.log(email)
		const userOtp = await Otp.find({ email: email });
		console.log(userOtp)
		if (userOtp) {
			if (userOtp[0].otp.length < 3) {
				const otp = this.GenerateOtp();
				userOtp[0].otp.push(otp);
				userOtp[0].save();
				const data = {
					email: email,
					password: password,
					name: name,
					otp: otp
				}
				this.sendEmail(data);
			}
			return res.status(200).json({
				message: "OTP regenrated check you email !!!"
			});
		}
		throw new Error('Something went wrong');
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
		const { otp, email, name, password } = jwt.verify(
			token,
			"secret",
		);
		console.log(otp.pop())
		const userOTP = await Otp.find({email:email});
		const user = await User.find({email:email});
		console.log(userOTP[0])
		if(!user[0]){
		 if (userOTP[0]) {
			console.log("otp", userOTP[0].otp.pop())
			if (userOTP[0].otp.pop() === otp.pop()) {
				console.log("wahab adil")
				const user = new User({
					_id: mongoose.Types.ObjectId(),
					name: name,
					email: email,
					password: password,
					email_Verified: true
				});
				user.save()
					// .select(' email password')
					.then((result) => {
						console.log(result)
						res.status(201).json({
							result,
							message: "Successfully Registered!!"
						});
					})
					.catch((err) => {
						console.log(err);
						res.status(501).json({
							error: err,
						});
					});
			} 
		}

	}else{
		return res.status(400).json({
			message:"User Already Exits"
		})
	}	 
		//throw new Error('Something went wrong');
	} catch (error) {
		res.status(500).json({
			message: 'Something went wrong,please try again later',
		});
	}
};