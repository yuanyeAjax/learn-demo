const http = require('http')
const os = require('os')
const fs = require('fs')
const crypto = require('crypto')

const PORT = 30

const getIP = () => {
  const ipList = os.networkInterfaces() // os模块自带方法
  for (key in ipList) {
    const iface = ipList[key]
    const findItem = iface.find(d => d.family === 'IPv4' && d.address !== '127.0.0.1' && !d.internal)
    if (findItem) {
      return findItem.address
    }
  }
}

http.createServer((req, res) => {
  const url = req.url
  console.log('--------', url)

  let content  = ''

  if (url === '/') {
    content = fs.readFileSync(`${__dirname}/index/index.html`)
  } else {
    if (url === '/img.png' || url === '/head.css') {
      res.setHeader('Cache-Control', 'max-age=10')
    }
    if (url === '/index.css') {
      const info = fs.statSync(`${__dirname}/index${url}`)

      const changeTime = info.mtime.toGMTString()

      const ifModifiedSince = req.headers['if-modified-since']

      if (ifModifiedSince === changeTime) {
        res.statusCode = 304
        return res.end()
      } else {
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Last-Modified', changeTime)
      }
    }
    if (url === '/index.js') {
      const data = fs.readFileSync(`${__dirname}/index${url}`)
      const hash = crypto.createHash('md5').update(data).digest('base64')
      const ifNoneMatch = req.headers['if-none-match']

      if (ifNoneMatch === hash) {
        res.statusCode = 304
        return res.end()
      } else {
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('ETag', hash)
      }
    }

    content = fs.readFileSync(`${__dirname}/index${url}`)
  }

  res.end(content)
}).listen(PORT)

const runPort = PORT === 80 ? '' : `:${PORT}`

console.log(`运行在:`)
console.log(`http://localhost${runPort}`)
console.log(`http://${getIP()}${runPort}`)