const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount, productName } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({success:false});

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "jwl_" + Date.now(),
      notes: { product: productName || "Jewelry" }
    });

    res.json({success:true, order});
  } catch (e) {
    console.error(e);
    res.status(500).json({success:false, message:"Order creation failed"});
  }
});

app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expected === razorpay_signature) {
    console.log("PAYMENT VERIFIED:", razorpay_payment_id);
    return res.json({success:true});
  }

  res.status(400).json({success:false, message:"Verification failed"});
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Open http://localhost:3000")
);