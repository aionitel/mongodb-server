import express from 'express';
import user from '../models/user';
import checkAuth  from '../middleware/checkAuth';
import { stripe } from '../stripe'

const router = express.Router();

router.get('/prices', async (req, res) => {
  const prices = await stripe.prices.list({
    apiKey: process.env.STRIPE_SECRET_KEY
  })
  res.send(prices)
})

export default router