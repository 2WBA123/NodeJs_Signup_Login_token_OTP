const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const { authSignUp, authLogin } = require('../validations/user.validate');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

exports.signUp = async (req, res) => {
	// JOI STARTS HERE
	// const { error, value } = authSignUp.validate(req.body); //JOI here validating
	// if (error) {
	// 	return res.json({
	// 		message: error.message,
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
						// Added Block -- Replaced
						const user = new User({
							_id: mongoose.Types.ObjectId(),
							name: req.body.name,
							email: req.body.email,
							password:hash
						});
						user.save()
							// .select(' email password')
							.then((result) => {
								res.status(201).json(result);
								nodemailer.sendConfirmationEmail(
                                 user.username,
                                 user.email,
                                 user.confirmationCode
                             );
							})
							.catch((err) => {
								console.log(err);
								res.status(500).json({
									error: err,
								});
							});
					}
				});
			}
		});
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
								message: 'Login Sucessfull !',
								token: token,
							});
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
	  const { user_id } =  jwt.verify(
		token,
		"secret",
	  );
     console.log(user_id)
	  const user = await User.findById(user_id);
	  if (user) {
		const { name, email} = user;
		return res.status(200).json({
		  user_id,
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