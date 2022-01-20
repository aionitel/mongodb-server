import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import checkAuth from '../middleware/checkAuth';
import { stripe } from '../stripe';

const router = express.Router();

router.post('/login', 
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 5 }).withMessage('Please enter a password with at least 5 characters'),
  
  async (req, res) => {
    try {
      console.log('Login request recieved.')

      const errors = validationResult(req);

      if (errors.isEmpty()) {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
          res.status(400).json({ msg: 'Invalid credentials.' });
        } else {
          const isMatch = await bcrypt.compare(password, user.password)

          if (isMatch) {
            const token = jwt.sign(
              {email: user.email},
              process.env.JWT_SECRET as string
            )

            res.status(200).json({
              token,
              user: {
                id: user.id,
                email: user.email
              }
            })

          } else {
            res.status(400).json({ msg: 'Something went wrong.' });
          }
        }
    } else {
      res.status(400).json({
        errors: errors.array(),
        data: null
      })
      }
     } catch (err) {
      res.status(400).json({
        errors: [{
          msg: err
        }]
      })
      }
})

router.post('/signup', 
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 5 }).withMessage('Please enter a password with at least 5 characters'),

  async (req, res) => {
    try {
      const valErrors = validationResult(req);

      if (!valErrors.isEmpty()) {
        return res.status(400).json({ errors: valErrors.array() });
      }
      
      const { email, password } = await req.body;

      const user = await User.findOne({ email });

      const hashedPassword = await bcrypt.hash(password, 12);
      
      if (user) {
        return res.status(400).json({
          errors: [{
            msg: 'User already exists'
          }],
          data: null
        })
      }

      const newUser = await User.create({ email, password: hashedPassword })

      const token = jwt.sign(
        {email: newUser.email},
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      )

      console.log(token)

      res.json({
        errors: [],
        data: {
          token,
          user: {
            id: newUser._id,
            email: newUser.email,
          }
        }
      })

      console.log('post recieved')
      console.log(email + " " + password)

    } catch (err) {
      console.log(err)
    }
})

router.post('/me', checkAuth, async (req, res) => {
  const token = req.headers["Authorization"] as string;
  
  if (jwt.verify(token, process.env.JWT_SECRET as string)) {
    const decoded = jwt.decode(token, { complete: true }) as any;
    const user = await User.findOne({ email: decoded.payload.email })

    console.log(decoded)
    console.log(user)

    return res.json({
      errors: [],
      data: {user: {
        id: user._id,
        email: user.email,
        customerId: user.customerId
      }}
    })
  } else {
    return res.status(400).json("Invalid token")
  }
})

export default router