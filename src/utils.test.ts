import type { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda'
import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import {
  compressV2,
  compressV2Sync,
  decodePayload,
  decodeResponseV2,
  decodeResponseV2Sync,
  decompress,
  decompressSync,
  eventMethodUrl,
  fakeEvent,
  fakeEventV1,
  fakeEventV2,
  pickEventContextV2,
} from './index'

describe('fakeEvent', () => {
  it('fakeEventV2 builds a v2 request event', () => {
    const event = fakeEventV2('GET', '/hello')
    expect(event.rawPath).toBe('/hello')
    expect(event.requestContext.http.method).toBe('GET')
  })

  it('fakeEventV2 merges custom spread', () => {
    const event = fakeEventV2('POST', '/submit', { body: 'payload' })
    expect(event.rawPath).toBe('/submit')
    expect(event.body).toBe('payload')
  })

  it('fakeEventV1 builds a v1 request event', () => {
    const event = fakeEventV1('GET', '/hello')
    expect(event.path).toBe('/hello')
    expect(event.httpMethod).toBe('GET')
  })

  it('fakeEvent merges v1 and v2 shapes', () => {
    const event = fakeEvent('PUT', '/item/1')
    expect(event.rawPath).toBe('/item/1')
    expect(event.path).toBe('/item/1')
    expect(event.httpMethod).toBe('PUT')
    expect(event.requestContext.http.method).toBe('PUT')
  })
})

describe('eventMethodUrl', () => {
  it('reads method and url from a v2 event', () => {
    const event = { rawPath: '/v2', requestContext: { http: { method: 'GET' } } } as unknown as APIGatewayProxyEventV2
    expect(eventMethodUrl(event)).toEqual(['GET', '/v2'])
  })

  it('reads method and url from a v1 event', () => {
    const event = { path: '/v1', httpMethod: 'DELETE' } as unknown as APIGatewayProxyEvent
    expect(eventMethodUrl(event)).toEqual(['DELETE', '/v1'])
  })

  it('throws on an invalid event', () => {
    expect(() => eventMethodUrl({} as any)).toThrow('Invalid event')
  })
})

describe('pickEventContextV2', () => {
  const event = {
    ...fakeEventV2('GET', '/full'),
    rawQueryString: 'a=1',
    routeKey: 'GET /full',
    headers: { 'x-test': 'yes' },
    isBase64Encoded: false,
  } as APIGatewayProxyEventV2

  it('picks the full context by default', () => {
    const picked = pickEventContextV2(event)
    expect(picked).toHaveProperty('routeKey')
    expect(picked).toHaveProperty('rawPath')
    expect(picked).toHaveProperty('rawQueryString')
    expect(picked).toHaveProperty('headers')
    expect(picked).toHaveProperty('requestContext')
    expect(picked).toHaveProperty('isBase64Encoded')
  })

  it('picks the minimal context when requested', () => {
    const picked = pickEventContextV2(event, { minimal: true })
    expect(picked.requestContext.http.method).toBe('GET')
  })
})

describe('compressV2 / compressV2Sync', () => {
  it('compresses with gzip and mutates the response', async () => {
    const response: any = {}
    const { encoding, data } = await compressV2('hello world', { response, acceptEncoding: 'gzip' })
    expect(encoding).toBe('gzip')
    expect(Buffer.isBuffer(data)).toBe(true)
    expect(response.body).toBe(data.toString('base64'))
    expect(response.isBase64Encoded).toBe(true)
    expect(response.headers['Content-Encoding']).toBe('gzip')
  })

  it('compresses with brotli when preferred', async () => {
    const { encoding } = await compressV2('hello world', { acceptEncoding: 'br' })
    expect(encoding).toBe('br')
  })

  it('throws on unknown accept-encoding', async () => {
    await expect(compressV2('data', { acceptEncoding: 'identity' })).rejects.toThrow('accept-encoding')
  })

  it('sync variant round-trips with decompressSync', () => {
    const { data } = compressV2Sync('roundtrip', { acceptEncoding: 'gzip' })
    expect(decompressSync(data, { contentEncoding: 'gzip' })).toBe('roundtrip')
  })

  it('async variant round-trips with decompress', async () => {
    const { data } = await compressV2('roundtrip', { acceptEncoding: 'gzip' })
    expect(await decompress(data, { contentEncoding: 'gzip' })).toBe('roundtrip')
  })
})

describe('decodePayload', () => {
  it('parses JSON payload by default', () => {
    const payload = Buffer.from('{"a":1}')
    expect(decodePayload(payload as any)).toEqual({ a: 1 })
  })

  it('returns the raw string when parse is disabled', () => {
    const payload = Buffer.from('{"a":1}')
    expect(decodePayload(payload as any, { parse: false })).toBe('{"a":1}')
  })

  it('throws on empty payload', () => {
    expect(() => decodePayload(undefined)).toThrow()
  })
})

describe('decodeResponseV2 / decodeResponseV2Sync', () => {
  it('leaves an uncompressed body untouched', () => {
    const response = { statusCode: 200, body: '{"ok":true}' } as any
    const decoded = decodeResponseV2Sync(response)
    expect(decoded.body).toEqual({ ok: true })
  })

  it('sync variant decompresses an encoded body', () => {
    const { data } = compressV2Sync('{"ok":true}', { acceptEncoding: 'gzip' })
    const response = {
      statusCode: 200,
      body: data.toString('base64'),
      headers: { 'Content-Encoding': 'gzip' },
      isBase64Encoded: true,
    } as any
    const decoded = decodeResponseV2Sync(response)
    expect(decoded.body).toEqual({ ok: true })
  })

  it('async variant decompresses an encoded body', async () => {
    const { data } = await compressV2('{"ok":true}', { acceptEncoding: 'gzip' })
    const response = {
      statusCode: 200,
      body: data.toString('base64'),
      headers: { 'Content-Encoding': 'gzip' },
      isBase64Encoded: true,
    } as any
    const decoded = await decodeResponseV2(response)
    expect(decoded.body).toEqual({ ok: true })
  })
})
