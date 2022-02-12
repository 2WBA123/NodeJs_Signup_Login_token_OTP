const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const { authSignUp, authLogin } = require('../validations/employee.validate');
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

	Employee.find({ email: req.body.email })
		.exec()
		.then((user) => {
			if (user.length >= 1) {
				return res.status(409).json({
					message: 'Email Already Exist !',
				});
			}
			// Validating Employee
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
							fname: req.body.fname,
							lname: req.body.lname,
							gender: req.body.gender,
							age: req.body.age,
							phone: req.body.phone,
							email: req.body.email,
							password: hash,
							department: req.body.department,
							role: req.body.role,
						});
						user
							.save()
							// .select(' email password')
							.then((result) => {
								res.status(201).json(result);
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
	const { error, value } = authLogin.validate(req.body); //JOI here validating
	if (error) {
		return res.json({
			message: error.message,
		});
	}
	// JOI ENDS HERE

	Employee.find({ email: req.body.email })
		.exec()
		.then((employee) => {
			if (employee.length < 1) {
				return res.status(404).json({
					message: 'No Email Found !',
				});
			}
			bcrypt.compare(req.body.password, employee[0].password, (err, result) => {
				if (err) {
					return res.status(401).json({
						message: 'Login Failed',
					});
				}

				// Getting Role through Email
				Employee.find({ email: req.body.email }).then((employee) => {
					Role.findById({ _id: employee[0].role }).then((val) => {
						console.log(val.name);
						//
						if (result) {
							const token = jwt.sign(
								{
									email: employee[0].email,
									role: val.name,
									id: employee[0].id,
								},
								process.env.JWT_KEY,
								{
									expiresIn: '5h',
								}
							);
							return res.status(200).json({
								message: 'Login Sucessful !',
								token: token,
							});
						}
						return res.status(401).json({
							message: 'Auth Failed',
						});
						//
					});
				});
				// Getting Role through Email - Ends Here
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
};