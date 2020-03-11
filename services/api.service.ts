//#region Global Imports
import { ServiceSchema, Context } from 'moleculer';
import ApiGateway = require('moleculer-web');
//import genuuid from 'uuid/v4'
// import express from 'express';
import session from 'express-session'
const redis = require('redis');
const redisStore = require('connect-redis')(session);
var redisClient  = redis.createClient();
const host = '127.0.0.1'
//#endregion Global Imports

const ApiService: ServiceSchema = {
	name: 'api',

	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,
		routes: [
			{
				aliases: {
					
				'GET /run-cron-job':'jobs.cronJobExample',

			},
				mappingPolicy: 'restrict',
				cors: {
					credentials: true,
					methods: ['GET', 'DELETE', 'POST', 'PUT', 'PATCH'],
					origin: ['*'],
				},

				async onBeforeCall(ctx:any, route:any, req:any, res:any) {
					// Set JWT token value to cookie context meta property
					return;
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

    async started() {
		await this.broker.waitForServices(['jobs']).then(async ()=>{
		await this.broker.call('jobs.cronJobExample')
		})
    },

    stopped():any {
        
    }
};

export = ApiService;
