import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async (req: VercelRequest, res: VercelResponse) => {
  const response = await fetch('https://ttwid.bytedance.com/ttwid/union/register/', {
    method: 'POST',
    body: JSON.stringify({
      region: 'cn',
      aid: 1768,
      needFid: false,
      service: 'www.ixigua.com',
      migrate_info: { ticket: '', source: 'node' },
      cbUrlProtocol: 'https',
      union: true,
    }),
  })

  const cookies = response.headers.get('set-cookie')

  return res.send(cookies?.match(/ttwid=(.*?);/)?.at(1))
}
