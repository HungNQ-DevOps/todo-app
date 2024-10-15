import jwt from 'jsonwebtoken'
import Axios from 'axios'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jsonWebKey = `https://dev-l8img43ixgtdhvhi.us.auth0.com/.well-known/jwks.json`

export async function handler(event) {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  if (!authHeader) throw new Error('No authorization header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authorization header')

  const split = authHeader.split(' ')
  const token = split[1]

  const decodedHeader  = jwt.decode(token, { complete: true })
  if (!decodedHeader) {
    throw new Error('Invalid token');
  }

  const response = await Axios(jsonWebKey)
  const signingKey = response.datakeys.find(
    key => key.kid === decodedHeader.header.kid
  )

  if (!signingKey) {
    throw new Error(`Can not find a signing key`)
  }
  
  const cert = signingKey.x5c[0].match(/.{1,64}/g).join('\n');
  const pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;

  return jwt.verify(token, pem, { algorithms: ['RS256'] })
}
