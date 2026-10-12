const Razorpay = require("razorpay");

// exports.instance = new Razorpay({
// 	key_id: process.env.RAZORPAY_KEY,
// 	key_secret: process.env.RAZORPAY_SECRET,
// });

// const RAZORPAY_KEY = "vyffyftytdtt"

// const RAZORPAY_SECRET = "tdcjkfddjfjy"

exports.instance = new Razorpay({
	key_id: process.env.REACT_APP_RAZORPAY_KEY_ID,
	key_secret: process.env.REACT_APP_RAZORPAY_SECRET,
});