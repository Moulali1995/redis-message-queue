//#region Global Imports
import { Context } from 'moleculer';
import { Action, BaseSchema, Method } from 'moleculer-decorators';
//#endregion Global Imports
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
//#region Interface Imports
//#endregion Interface Imports

export class AuthService extends BaseSchema {

	public name: string = 'auth';
	// public started: Function = async () => await connectionInstance();

	/**
	* @swagger
	*
	*  /auth/<methodName>:
	//Example usage of swagger https://swagger.io/docs/specification/2-0/basic-structure/ }}//
	*      responses:
	*        200:
	*          description: Response message
	*        422:
	*          description: Response message
	*/
	@Action({
		params: {
			username: { type: "string" },
			password: { type: "string" },
			//role: { type: "string" }
		}
	})
	public async login(ctx: Context<any>): Promise<any> {
		return this.loginMethod(ctx);
	}

	@Method
	public async loginMethod(ctx: Context<any>): Promise<any> {
		
		try {
			let {username, password, role} = ctx.params;
			// Search and authenticate the user
			
			/* To generate hash for the password provided 
			const saltRounds = 10;
			var hash = bcrypt.hashSync(password, saltRounds);
			console.log(hash)
			*/
			const response={
				id:1,
				name:'user1',
				password:'admin',
				role:'admin'
			}
			if(password == response.password){
				// setting payload object user id, name, role
				let payload={
					id:response.id,
					username:response.name,
					role:response.role
				}
					// setting the expiry date of token as 1 year
					let token= await ctx.call('auth.generateToken',{payload:payload})
					return {key:token}
				
			} else {
				ctx.meta.$statusCode = 404;
				return "Invalid credentials";
			}
			
		}
		catch (Error) {
			return Error.name
		}

	}
	// addIpRange creation API ends here //

	// getIpRange listing API starts here //
	@Action({
		params: {
			token: { type: "string" }
		}
	})
	public async verifyToken(ctx: Context<any>): Promise<any> {
		return this.verifyTokenMethod(ctx);
	}

	@Method
	public async verifyTokenMethod(ctx: Context<any>): Promise<any> {
		let { token } = ctx.params;
		try{
			let secret:any = process.env.SECRET_KEY
			let decoded= jwt.verify(token,secret)
			return decoded;
		}
		catch (Error) {
			return false;
		}

	}

	// Generate a jwt token
	@Action({
		params: {
			payload: { type: "object", props: {
				id: { type: "number", positive: true },
				username: { type: "string" },
				role:  { type: "string" }
			}  }
		}
	})
	public async generateToken(ctx: Context<any>): Promise<any> {
		return this.generateTokenMethod(ctx);
	}

	@Method
	public async generateTokenMethod(ctx: Context<any>):Promise<any>
	{
		try{
			const params = ctx.params.payload
		let secret:any=process.env.SECRET_KEY
		let expiresIn:any=process.env.JWT_EXPIRESIN
		let payload_data={
			id:params.id,
			username:params.username,
			role:params.role
		}
		let token= jwt.sign(payload_data,secret, { expiresIn: expiresIn })
		return token;
		}
		catch(Error){
			return Error.name
		 
		}
	}
	// public stopped: Function = async () => await getConnection().close();
}

module.exports = new AuthService();