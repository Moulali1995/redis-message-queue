const E = require("moleculer-web").Errors;
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

            public static async authorize(ctx:any,req:any) {
			// ================================ COOKIE VALIDATION ==============================
			
			if(req.headers.cookie){
				
				// retrieve the cookie data from the incoming cookie string value consisting of all the cookies
				let cookie_data=req.headers.cookie.split(';')
				let valid_cookie_data=cookie_data.map((obj:any)=>{
				const cookie_obj={
					name:obj.slice(0,obj.indexOf('=')).trim(),
					value:obj.slice(obj.indexOf('=')+1)
				}
				return cookie_obj;
				})
				// filter the cookie with cookie.name is 'session_token' which consists jwt token
				var data= valid_cookie_data.filter((obj:any)=>{
					return obj.name==='session_token'
				})
			
				// Verify jwt token
				let token = data[0].value
				if (token) {
					let decoded = await ctx.call('auth.verifyToken',{token:token})
                    if (decoded) {
						// set context meta property with decoded value for use in actions
					
						// Refresh the token if the expiry time nearby
					if(Math.floor((decoded.exp-new Date().getTime()/1000)/60)<Number(process.env.REFRESH_JWT_EXPIRESIN))
					{
						 data[0].value=await ctx.call('auth.generateToken',{payload:decoded})
					}
						ctx.meta.user=decoded
						ctx.meta.$responseHeaders={
							'Cookie':`${data[0].name}=${data[0].value}`
						}
						return Promise.resolve(ctx);
                    } else
                    return Promise.reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN));
				} else
					return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));

			/* VERIFY JWT TOKEN USING AUTHORIZATION HEADER
			================================================================================

				// Verify jwt token
                let bearer = ctx.meta.bearer
                // let auth = req.headers["Authorization"];
				if (bearer && bearer.split(" ")[1]) {
					let token = bearer.split(" ")[1];
					let decoded = await ctx.call('auth.verifyToken',{token:token})
                    if (decoded) {
						ctx.meta.user=decoded
						return Promise.resolve(ctx);
                    } else
                    return Promise.reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN));
				} else
					return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));

			====================================================================================
			*/
			}
			else{
				return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));
			}
			}
			
}