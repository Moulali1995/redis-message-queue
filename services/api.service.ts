//#region Global Imports
import { ServiceSchema, Context } from 'moleculer';
import ApiGateway = require('moleculer-web');
import {Authorization} from '@Meta/Authorization'
//import genuuid from 'uuid/v4'
// import express from 'express';
import session from 'express-session'
const redis = require('redis');
const redisStore = require('connect-redis')(session);
var redisClient  = redis.createClient();
const host = '127.0.0.1'
//#endregion Global Imports

const ApiService: ServiceSchema = {
	name: 'v1',

	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,
		routes: [
			{
				aliases: {
					
				'GET /user':'shift.getUsers',

			},
				mappingPolicy: 'restrict',
				cors: {
					credentials: true,
					methods: ['GET', 'DELETE', 'POST', 'PUT', 'PATCH'],
					origin: ['*'],
				},

				async onBeforeCall(ctx:any, route:any, req:any, res:any) {
					// Set JWT token value to cookie context meta property
					ctx.meta.cookie= req.headers.cookie
					// call authorize to verify the token passed in the header
					try{
						return await Authorization.authorize(ctx,req)
						}
					catch(error){
						// Throw error which will be caught by Route level error handler 
						throw error;
						}
				},
				path: '/api',
				onError(req:any, res:any, err:any) {
					res.setHeader("Content-Type", "application/json; charset=utf-8");
					res.writeHead(401);
					const response = {
						statuscode: 401,
						error: err.name,
						requestRef: '',
						data: err.message,
					};
					res.end(JSON.stringify(response));
				}
			},
			{
				path: '/auth',
				aliases: {

				// auth APIs
				"POST /login":"auth.login",
				"GET /verify":"auth.verifyToken",
				"POST /token":"auth.generateToken"

				},
				mappingPolicy: "restrict",
				cors: {
					credentials: true,
					methods: ['GET', 'DELETE', 'POST', 'PUT', 'PATCH'],
					origin: ['*'],
				},
				bodyParsers: {
					json: true
				},
				async onBeforeCall(ctx: Context, route: any, req: any, res: any) {
					// Set session_token value to cookie context meta property
					ctx.meta.cookie = req.headers.cookie;
				},
				onAfterCall(ctx: any, route: any, req: any, res: any, data: any) {
					return data;
				},
				
			}
		],

		// Serve assets from 'public' folder
		assets: {
			folder: 'public',
		}
	},

	// express server
	created():any {
		
		
    },

    started():any {

       

    },

    stopped():any {
        
    }
};

export = ApiService;
