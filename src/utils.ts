import type { InvokeCommandOutput } from '@aws-sdk/client-lambda'
import type { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import type { InputType } from 'node:zlib'
import type { PartialDeep, PickDeep } from 'type-fest'
import type { LambdaRequestEvent } from './types'
import { Buffer } from 'node:buffer'
import { promisify } from 'node:util'
import { brotliCompress, brotliCompressSync, brotliDecompress, brotliDecompressSync, gunzip, gunzipSync, gzip, gzipSync, constants as zlibConstants } from 'node:zlib'
import { DetailedError, objectPick, objectSet } from '@namesmt/utils'
import { destr } from 'destr'

/**
 * Creates a sample event that are compatible with most router engine for testing purposes.
 */
export function fakeEvent(method: string, path: string, spread?: Record<string, any>): ReturnType<typeof fakeEventV2> & ReturnType<typeof fakeEventV1> {
  // @ts-expect-error requestContext is incompatible, just ignore it
  return {
    ...fakeEventV2(method, path),
    ...fakeEventV1(method, path),
    ...spread,
  }
}

/**
 * Creates a sample event that are compatible with most router engine for testing purposes.
 * 
 * Specifically v2 request payload
 */
export function fakeEventV2(method: string, path: string, spread?: Record<string, any>): PickDeep<APIGatewayProxyEventV2, 'rawPath' | 'requestContext.http.method'> & PartialDeep<APIGatewayProxyEventV2> {
  return {
    rawPath: path,
    requestContext: {
      http: {
        method,
      },
    },
    ...spread,
  }
}

/**
 * Creates a sample event that are compatible with most router engine for testing purposes.
 * 
 * Specifically v1 request payload
 */
export function fakeEventV1(method: string, path: string, spread?: Record<string, any>): Pick<APIGatewayProxyEvent, 'path' | 'httpMethod'> & PartialDeep<APIGatewayProxyEvent> {
  return {
    path,
    httpMethod: method,
    ...spread,
  }
}

/**
 * Get the method and url from a request-based event
 */
export function eventMethodUrl(event: LambdaRequestEvent): [string, string] {
  if ('rawPath' in event) {
    return [event.requestContext.http.method, event.rawPath]
  }
  else if ('path' in event) {
    return [event.httpMethod, event.path]
  }
  else {
    throw new Error('Invalid event')
  }
}

/**
 * This utility picks the following keys from the event: routeKey, rawPath, rawQueryString, headers, requestContext, isBase64Encoded
 * 
 * @param {boolean} [options.minimal] - pick only: routeKey, rawPath, headers, requestContext.http.method
 */
export function pickEventContextV2<M extends boolean = false>(event: APIGatewayProxyEventV2, options: { minimal?: M } = {}): PickDeep<
  APIGatewayProxyEventV2,
  M extends false
    ? ('routeKey' | 'rawPath' | 'rawQueryString' | 'headers' | 'requestContext' | 'isBase64Encoded')
    : ('routeKey' | 'rawPath' | 'headers' | 'requestContext.http.method')
> {
  return options.minimal
    // @ts-expect-error Some weird PickDeep bug
    ? { ...objectPick(event, ['routeKey', 'rawPath', 'rawQueryString', 'headers']), requestContext: { http: { method: event.requestContext?.http?.method } } }
    : objectPick(event, ['routeKey', 'rawPath', 'rawQueryString', 'headers', 'requestContext', 'isBase64Encoded'])
}

interface CompressOptions {
  response?: APIGatewayProxyStructuredResultV2
  acceptEncoding?: string
  level?: number
}
/**
 * Compress inputted data, `response` could be passed in to mutate it.
 */
export async function compressV2(data: InputType, { response, acceptEncoding = '*', level = 1 }: CompressOptions): Promise<{ encoding: string, data: Buffer }> {
  let result: { encoding: string, data: Buffer } | undefined

  if (acceptEncoding.includes('*') || acceptEncoding.includes('br')) {
    result = {
      encoding: 'br',
      data: await promisify(brotliCompress)(data, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: level } }),
    }
  }

  if (acceptEncoding.includes('gzip')) {
    result = {
      encoding: 'gzip',
      data: await promisify(gzip)(data, { level }),
    }
  }

  if (result) {
    if (response) {
      objectSet(response, 'headers.Content-Encoding', result.encoding)
      response.body = result.data.toString('base64')
      response.isBase64Encoded = true
    }

    return result
  }

  throw new Error(`Unknown 'accept-encoding': '${acceptEncoding}'`)
}

/**
 * Compress inputted data, `response` could be passed in to help mutate it.
 */
export function compressV2Sync(data: InputType, { response, acceptEncoding = '*', level = 1 }: CompressOptions): { encoding: string, data: Buffer } {
  let result: { encoding: string, data: Buffer } | undefined

  if (acceptEncoding.includes('*') || acceptEncoding.includes('br')) {
    result = {
      encoding: 'br',
      data: brotliCompressSync(data, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: level } }),
    }
  }

  if (acceptEncoding.includes('gzip')) {
    result = {
      encoding: 'gzip',
      data: gzipSync(data, { level }),
    }
  }

  if (result) {
    if (response) {
      objectSet(response, 'headers.Content-Encoding', result.encoding)
      response.body = result.data.toString('base64')
      response.isBase64Encoded = true
    }

    return result
  }

  throw new Error(`Unknown 'accept-encoding': '${acceptEncoding}'`)
}

export async function decompress(compressedData: string | Buffer, options: { contentEncoding: string }): Promise<string> {
  const {
    contentEncoding,
  } = options

  if (typeof compressedData === 'string')
    compressedData = Buffer.from(compressedData, 'base64')

  if (contentEncoding === 'br')
    return (await promisify(brotliDecompress)(compressedData)).toString()

  if (contentEncoding === 'gzip')
    return (await promisify(gunzip)(compressedData)).toString()

  throw new Error(`Unknown contentEncoding: '${contentEncoding}'`)
}

export function decompressSync(compressedData: string | Buffer, options: { contentEncoding: string }): string {
  const {
    contentEncoding,
  } = options

  if (typeof compressedData === 'string')
    compressedData = Buffer.from(compressedData, 'base64')

  if (contentEncoding === 'br')
    return brotliDecompressSync(compressedData).toString()

  if (contentEncoding === 'gzip')
    return gunzipSync(compressedData).toString()

  throw new Error(`Unknown contentEncoding: '${contentEncoding}'`)
}

/**
 * Helper to decompress and parse the response's body if needed
 * 
 * This is mainly used with {@link decodePayload} for lambda invocation cases, where you need to decode the response body
 */
export function decodeResponseV2Sync<R extends APIGatewayProxyStructuredResultV2>(response: R): R {
  const contentEncoding = response.headers?.['Content-Encoding'] as string | undefined

  let responseBody = response.body
  if (contentEncoding)
    responseBody = decompressSync(response.body!, { contentEncoding })

  responseBody = destr(responseBody)

  return {
    ...response,
    body: responseBody,
  }
}

/**
 * Helper to decompress and parse the response's body if needed
 * 
 * This is mainly used with {@link decodePayload} for lambda invocation cases, where you need to decode the response body
 */
export async function decodeResponseV2<R extends APIGatewayProxyStructuredResultV2>(response: R): Promise<R> {
  const contentEncoding = response.headers?.['Content-Encoding'] as string | undefined

  let responseBody = response.body
  if (contentEncoding)
    responseBody = await decompress(response.body!, { contentEncoding })

  responseBody = destr(responseBody)

  return {
    ...response,
    body: responseBody,
  }
}

/**
 * Decodes a lambda {@link InvokeCommandOutput} payload
 */
export function decodePayload(payload: InvokeCommandOutput['Payload'], options: { parse?: boolean } = {}) {
  const {
    parse = true,
  } = options

  if (!payload)
    throw new DetailedError('Empty payload', { log: payload })

  const stringPayload = Buffer.from(payload).toString()

  return parse ? JSON.parse(stringPayload) : stringPayload
}
