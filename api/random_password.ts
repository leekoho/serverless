import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const {
    // password length
    length = '18',
    // include special symbols
    symbols = '1',
  } = req.query

  const chars = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789${
    symbols === '1' ? '!@#$%^&*' : ''
  }`

  res.setHeader('Content-Type', 'text/plain')

  return res.send(
    ''
      .padStart(Number(length))
      .replace(/\s/g, () => chars[Math.floor(Math.random() * chars.length)])
  )
}
