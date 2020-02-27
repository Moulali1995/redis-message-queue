const E = require("moleculer-web").Errors;

const cookie = require('cookie');

import genuuid from 'uuid/v4';
const redis = require('redis');
var redisClient = redis.createClient();
export class Authorization{
    /**
			 * Authorize the user from request
			 *
			 * @param {Context} ctx
			 * @param {Object} route
			 * @param {IncomingMessage} req
			 * @param {ServerResponse} res
			 * @returns
			 */

			public static async authorize(ctx: any, req: any) {
				// ================================ COOKIE VALIDATION ==============================
		
				if (req.headers.cookie) {
					// Extract the cookies
					let cookie_data = cookie.parse(req.headers.cookie);
					// Get session_token cookie value
					let uuid = cookie_data.session_token;
					// Get JWT Token for the associated session_token
					var clientGet = async (uuid: any) => {
						return new Promise((resolve, reject) => {
							redisClient.get(uuid, (err: any, data: any) => {
								if (err) reject(err);
								else resolve(data);
							});
						});
					};
		
					let token = await clientGet(uuid).then((result: any) => {
						return result;
					});
		
					console.log('uuid:', uuid, 'token:', token);
		
					// Verify the Token
					if (token) {
						let decoded = await ctx.call('auth.verifyToken', { token: token });
						if (decoded) {
							// Refresh the token if the expiry time nearby
							if (
								Math.floor((decoded.exp - new Date().getTime() / 1000) / 60) <
								Number(process.env.REFRESH_JWT_EXPIRESIN)
							) {
								// Generate new JWT Token if the token is expiring soon
								token = await ctx.call('auth.generateToken', { payload: decoded });
								uuid = genuuid();
								redisClient.set(uuid, token);
							}
							// Set context meta property ctx.meta.user with decoded value
							ctx.meta.user = decoded;
							// Send session_token back to client for each request
							ctx.meta.$responseHeaders = {
								'Set-Cookie': `session_token=${uuid};Path=/;Max-Age=${Number(
									process.env.COOKIE_MAXAGE,
								) * 60}`,
							};
							return Promise.resolve(ctx);
						} else {
							// Logout to delete the redis uuid token
							await ctx.call('auth.logout');
							return Promise.reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN));
						}
					} else return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));
				} else {
					return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));
				}
			}
		}