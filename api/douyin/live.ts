import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
// @ts-ignore
import getSign from './sign/sign.cjs'
// import { USER_AGENT } from '../../shared/consts'
import jsdom from 'jsdom'

const { JSDOM } = jsdom

const dom = new JSDOM('<!DOCUMENT html><p>hello world</p>')

console.log(dom.window.navigator)

const USER_AGENT =
  '5.0%20(Windows%20NT%2010.0;%20Win64;%20x64)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/126.0.0.0%20Safari/537.36'

const md5 = (data: string) => createHash('md5').update(data, 'utf-8').digest('hex')

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

export default async (req: VercelRequest, res: VercelResponse) => {
  const { liveId = '325725889409' } = req.query

  const url = `https://live.douyin.com/${liveId}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Cookie: '__ac_nonce=063abcffaoed8507d599',
    },
  })

  const html = (await response.text()).replace(/\\/g, '')
  const cookies = response.headers.getSetCookie().at(0)

  // console.log('html', html)

  const roomId = html.match(/"roomId":"(.*?)"/)?.at(1)
  const userUniqueId = html.match(/"user_unique_id":"(.*?)"/)?.at(1)

  console.log('roomId, userUniqueId', roomId, userUniqueId)

  const timestamp = Date.now()

  const hostnames = [
    'webcast3-ws-web-hl.douyin.com',
    'webcast3-ws-web-lf.douyin.com',
    'webcast100-ws-web-lq.amemv.com',
    'webcast3-ws-web-lq.douyin.com',
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
    screen_width: '1440',
    screen_height: '900',
    browser_language: 'zh-CN',
    browser_platform: 'Win32',
    browser_name: 'Mozilla',
    browser_version: USER_AGENT,
    browser_online: 'true',
    tz_name: 'Asia/Shanghai',
    cursor: `t-${timestamp}_r-1_d-1_u-1_fh-7397971688119882802`,
    internal_ext: `internal_src:dim|wss_push_room_id:${roomId}|wss_push_did:${userUniqueId}|first_req_ms:${timestamp - 80}|fetch_time:${timestamp}|seq:1|wss_info:0-${timestamp}-0-0|wrds_v:7397978801109468886`,
    host: 'https://live.douyin.com',
    aid: '6383',
    live_id: '1',
    did_rule: '3',
    endpoint: 'live_pc',
    support_wrds: '1',
    user_unique_id: `${userUniqueId}`,
    im_path: '/webcast/im/fetch',
    identity: 'audience',
    need_persist_msg_count: '15',
    insert_task_id: '',
    live_reason: '',
    room_id: `${roomId}`,
    heartbeatDuration: '0',
  })

  const signature = getSign(md5(websocketKeys.map(key => `${key}=${params.get(key) || ''}`).join()))

  params.set('signature', signature['X-Bogus'])

  res.setHeader('Content-Type', 'application/json')

  res.send({
    roomId,
    userUniqueId,
    wssUrl: decodeURIComponent(`wss://${hostname}/webcast/im/push/v2/?${params}`),
    // wssUrl:
    //   'wss://webcast5-ws-web-lq.douyin.com/webcast/im/push/v2/?app_name=douyin_web&version_code=180800&webcast_sdk_version=1.0.14-beta.0&update_version_code=1.0.14-beta.0&compress=gzip&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Mozilla&browser_version=5.0%20%28Windows%20NT%2010.0;%20Win64;%20x64%29%20AppleWebKit/537.36%20%28KHTML,%20like%20Gecko%29%20Chrome/126.0.0.0%20Safari/537.36&browser_online=true&tz_name=Asia/Shanghai&cursor=t-1722477059184_r-1_d-1_u-1_fh-7397979927574402075&internal_ext=internal_src:dim%7Cwss_push_room_id:7397954038702148388%7Cwss_push_did:7356204987120911883%7Cfirst_req_ms:1722477059118%7Cfetch_time:1722477059184%7Cseq:1%7Cwss_info:0-1722477059184-0-0%7Cwrds_v:7397982627925336509&host=https://live.douyin.com&aid=6383&live_id=1&did_rule=3&endpoint=live_pc&support_wrds=1&user_unique_id=7356204987120911883&im_path=/webcast/im/fetch/&identity=audience&need_persist_msg_count=15&insert_task_id=&live_reason=&room_id=7397954038702148388&heartbeatDuration=0&signature=60TkKr2DUzG0loJp',
    ttwid: cookies?.match(/ttwid=(.*?);/)?.at(1),
    title: html.match(/,"title":"(.*?)"/)?.at(1),
    nickname: html.match(/"nickname":"(.*?)"/)?.at(1),
    avatar: html.match(/"avatar_thumb":\{"url_list":\["(.*?)"/)?.at(1),
  })
}
