import type { VercelRequest, VercelResponse } from '@vercel/node'

export default (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'text/plain')
  return res.send(req.headers['x-forwarded-for'])
}
