//#region Global Imports
import { Context } from 'moleculer';
import { Action, BaseSchema, Method } from 'moleculer-decorators';
import { getConnection } from 'typeorm';
//#endregion Global Imports

export class ShiftService extends BaseSchema {

	public name: string = 'shift';
	// public started: Function = async () => await connectionInstance();

	/**
	* @swagger
	*
	*  /shift/<methodName>:
	//Example usage of swagger https://swagger.io/docs/specification/2-0/basic-structure/ }}//
	*      responses:
	*        200:
	*          description: Response message
	*        422:
	*          description: Response message
	*/
	@Action({
		params: {

		}
	})
	public async getUsers() {
		// how to access the session id here?
		
		return "user details";
	}


	// public stopped: Function = async () => await getConnection().close();
}

module.exports = new ShiftService();