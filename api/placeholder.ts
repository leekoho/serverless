import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const {
    // width
    w,
    // height
    h,
    // front color
    fg = '#52525b',
    // background color
    bg = '#d4d4d8',
    // text
    text,
    // font size
    fz,
  } = req.query
  const _w = ~~Number(w) || 200
  const _h = ~~Number(h) || 200
  const _text = text || `${_w} X ${_h}`
  const _fz = ~~Number(fz) || ~~(_w / 10)

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${_w}" height="${_h}" viewBox="0 0 ${_w} ${_h}">
      <rect width="${_w}" height="${_h}" fill="${bg}" />
      <text 
        text-anchor="middle"
        dominant-baseline="central"
        x="${~~(_w / 2)}"
        y="${~~(_h / 2)}"
        font-size="${_fz}px"
        fill="${fg}"
      >
        ${_text}
      </text>
      <style>
        text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
  'Noto Color Emoji;
        }
</style>
    </svg>`
      // compresses
      .replace(/[\n\r\t]/g, '')
      .replace(/\s*(<|\/>|\/?>)\s*/g, '$1')
      .replace(/\s+/g, ' ')

  res.setHeader('Content-Type', 'image/svg+xml')

  res.send(svg)
}
