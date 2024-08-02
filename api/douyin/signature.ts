import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
import frontierSign from './sign/webmssdk.es5.cjs'

const md5 = (data: string) => createHash('md5').update(data, 'utf-8').digest('hex')

export default (req: VercelRequest, res: VercelResponse) => {
  const { data } = req.query

  res.json(frontierSign(md5(data as string)))
}
