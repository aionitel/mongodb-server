import { Request, Response, NextFunction } from 'express'
import JWT from 'jsonwebtoken';

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Hello I am middleware.')
  
  let token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({
      errors: [{
        msg: 'No token provided.'
      }],
      data: 'Sorry, not authenticated.'
    })
  } else {
    token = token.split(' ')[1];

    try {

      // verify token/user then move on to process request
      if (await JWT.verify(token, process.env.JWT_SECRET as string) as { email: string }) {
        next()
      }

    } catch (err) {
      console.log(err)

      return res.status(400).json({
        errors: [
          {
            msg: 'Invalid token.'
          }
        ],
        data: null
      })
    }
  }
}

export default checkAuth