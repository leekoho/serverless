import type { VercelRequest, VercelResponse } from '@vercel/node'
// @ts-ignore
import getSign from './sign/sign.cjs'
// import { USER_AGENT } from '../../shared/consts'

const USER_AGENT =
  '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export default async (req: VercelRequest, res: VercelResponse) => {
  const { roomId } = req.query

  const timestamp = Date.now()

  const hostnames = [
    'webcast3-ws-web-hl.douyin.com',
    'webcast3-ws-web-lf.douyin.com',
    'webcast100-ws-web-lq.amemv.com',
    'webcast3-ws-web-lq.douyin.com',
  ]

  const hostname = hostnames.at(Math.floor(Math.random() * hostnames.length))

  const params = new URLSearchParams({
    browser_version: USER_AGENT,
    internal_ext: `internal_src:dim|wss_push_room_id:${roomId}|wss_push_did:${roomId}|dim_log_id:20230521093022204E5B327EF20D5CDFC6|fetch_time:${timestamp}|seq:1|wss_info:0-1671748199438-0-0|wrds_kvs:WebcastRoomRankMessage-1671748147622091132_WebcastRoomStatsMessage-1684632616357153318`,
    room_id: `${roomId}`,
    // signature: '00000000',
    app_name: 'douyin_web',
    version_code: '180800',
    webcast_sdk_version: '1.3.0',
    update_version_code: '1.3.0',
    compress: 'gzip',
    cursor: 't-1684632622323_r-1_d-1_u-1_h-1',
    host: 'https://live.douyin.com',
    aid: '6383',
    live_id: '1',
    did_rule: '3',
    debug: 'false',
    endpoint: 'live_pc',
    support_wrds: '1',
    im_path: '/webcast/im/fetch/&device_platform=web',
    cookie_enabled: 'true',
    screen_width: '1440',
    screen_height: '900',
    browser_language: 'zh',
    browser_platform: 'MacIntel',
    browser_name: 'Mozilla',
    browser_online: 'true',
    tz_name: 'Asia/Shanghai',
    identity: 'audience',
    heartbeatDuration: '0',
  })

  const signature = getSign(`wss://${hostname}/webcast/im/push/v2/?${params.toString()}`)

  params.set('signature', signature['X-Bogus'])

  res.send(decodeURIComponent(`wss://${hostname}/webcast/im/push/v2/?${params.toString()}`))
}
