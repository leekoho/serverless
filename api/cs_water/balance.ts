import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'

export default async (req: VercelRequest, res: VercelResponse) => {
  /**
   * 源码
   */
  // g = ''
  // C = (new Date().getTime() / 1e3).toFixed(),
  // _ = h(16),
  // I = Object(c['a'])(C + g + _ + C),
  // let A = {
  //   'x-tif-appid': f,
  //   'x-tif-loginUserid': b,
  //   'x-tif-token': g,
  //   'x-tif-timestamp': C,
  //   'x-tif-nonce': _,
  //   'x-tif-sign': I,
  // }

  const { code } = req.query

  function h(t: number) {
    t = t || 16
    let e = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',
      s = e.length,
      a = ''
    for (let i = 0; i < t; i++) a += e.charAt(Math.floor(Math.random() * s))
    return a
  }
  const sha256 = (data: string) => createHash('sha256').update(data, 'utf-8').digest('hex')

  const appid = 'handheld'
  const loginUserid = '0'
  const timestamp = (new Date().getTime() / 1e3).toFixed()
  const token = ''
  const nonce = h(16)
  const sign = sha256(timestamp + token + nonce + timestamp)

  const response = await fetch('https://smartgate.supplywater.com/WFTPay/JSAPI/balanceInfo', {
    method: 'POST',
    headers: {
      'x-tif-timestamp': timestamp,
      'x-tif-appid': appid,
      'x-tif-loginUserid': loginUserid,
      'x-tif-sign': sign,
      'x-tif-token': token,
      'x-tif-nonce': nonce,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      water_meterno: code,
    }),
  })

  const passedValue = await new Response(response.body).text()
  const body = JSON.parse(passedValue)

  console.log(body)
  return res.json(body.Data)
}
