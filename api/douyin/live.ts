import type { VercelRequest, VercelResponse } from '@vercel/node'
// @ts-ignore
// import ba from './signature/byted_acrawler.cjs'
// @ts-ignore
import webmssdk from '../../shared/signature/webmssdk.es5.cjs'
import { md5 } from '../../shared/utils/md5.js'

// const byted_acrawler = ba.default

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

const websocketKeys = [
  'live_id',
  'aid',
  'version_code',
  'webcast_sdk_version',
  'room_id',
  'sub_room_id',
  'sub_channel_id',
  'did_rule',
  'user_unique_id',
  'device_platform',
  'device_type',
  'ac',
  'identity',
]

const getAcNonce = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  })
  const cookies = response.headers.get('set-cookie')

  return cookies?.match(/__ac_nonce=(.*?);/)?.at(1)
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const { liveId } = req.query

  if (!liveId) {
    return res.status(400).json({ message: 'Missing liveId' })
  }

  const baseUrl = 'https://live.douyin.com/'

  const url = `${baseUrl}${liveId}`

  // byted_acrawler.init({ aid: 99999999, dfp: 0 })

  const __ac_nonce = await getAcNonce(url)

  const cookieObj = {
    __ac_nonce,
    __ac_ns: Date.now(),
    __ac_referer: baseUrl || '__ac_blank',
    // __ac_signature: byted_acrawler.sign('', __ac_nonce),
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'h-CN,zh;q=0.9,en;q=0.8',
      referer: 'https://live.douyin.com/',
      Cookie: Object.entries(cookieObj)
        .map(([key, value]) => `${key}=${value}`)
        .join(';'),
    },
  })

  const html = (await response.text()).replace(/\\/g, '')

  if (!html) {
    return res.status(404).json({ message: `${url} fetch fail` })
  }

  const cookies = response.headers.get('set-cookie')

  const ttwid = cookies?.match(/ttwid=(.*?);/)?.at(1)

  const roomId = html.match(/"roomId":"(\d*?)"/)?.at(1)

  if (!roomId) {
    return res.status(404).json({ message: 'Live not found' })
  }

  const userUniqueId = html.match(/"user_unique_id":"(\d*?)"/)?.at(1)
  const title = html.match(/,"title":"(.*?)"/)?.at(1)
  const nickname = html.match(/"sec_uid":"(([a-zA-Z0-9-_])+)","nickname":"(.*?)"/)?.at(-1)
  const avatar = html.match(/"avatar_thumb":\{"url_list":\["(.*?)"/)?.at(1)
  const userCountStr = html.match(/"user_count_str":"(.*?)"/)?.at(1)

  const timestamp = Date.now()

  const hostnames = [
    'webcast3-ws-web-hl.douyin.com',
    'webcast3-ws-web-lf.douyin.com',
    'webcast3-ws-web-lq.douyin.com',
    'webcast100-ws-web-lq.amemv.com',
    'webcast100-ws-web-hl.amemv.com',
    'webcast100-ws-web-lf.amemv.com',
  ]

  const hostname = hostnames.at(Math.floor(Math.random() * hostnames.length))

  const params = new URLSearchParams({
    app_name: 'douyin_web',
    version_code: '180800',
    webcast_sdk_version: '1.0.14-beta.0',
    update_version_code: '1.0.14-beta.0',
    compress: 'gzip',
    device_platform: 'web',
    cookie_enabled: 'true',
    screen_width: '1920',
    screen_height: '1080',
    browser_language: 'zh-CN',
    browser_platform: 'MacIntel',
    browser_name: 'Mozilla',
    browser_version: USER_AGENT,
    browser_online: 'true',
    tz_name: 'Asia/Shanghai',
    cursor: `h-1_t-${timestamp}_r-1_d-1_u-1`,
    internal_ext: `internal_src:dim|wss_push_room_id:${roomId}|wss_push_did:${userUniqueId}|first_req_ms:${timestamp - 80}|fetch_time:${timestamp}|seq:1|wss_info:0-${timestamp}-0-0|wrds_v:7397978801109468886`,
    host: 'https://live.douyin.com',
    aid: '6383',
    live_id: '1',
    did_rule: '3',
    endpoint: 'live_pc',
    support_wrds: '1',
    user_unique_id: `${userUniqueId}`,
    im_path: '/webcast/im/fetch/',
    identity: 'audience',
    need_persist_msg_count: '15',
    insert_task_id: '',
    live_reason: '',
    room_id: `${roomId}`,
    heartbeatDuration: '0',
  })

  const signature = webmssdk.frontierSign({
    'X-MS-STUB': md5(websocketKeys.map((key) => `${key}=${params.get(key) ?? ''}`).join()),
  })

  params.set('signature', signature['X-Bogus'])

  const wssUrl = decodeURIComponent(`wss://${hostname}/webcast/im/push/v2/?${params}`)

  res.json({
    roomId,
    userUniqueId,
    title,
    nickname,
    avatar,
    userCountStr,
    ttwid,
    wssUrl,
  })
}
