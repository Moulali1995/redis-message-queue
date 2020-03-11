//#region Global Imports
import { Context } from 'moleculer';
import { Action, BaseSchema, Method } from 'moleculer-decorators';
import Bull from 'bull';
//#endregion Global Imports

export class JobsService extends BaseSchema {

	public name: string = 'jobs';
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
	public async cronJobExample(ctx: Context<any>): Promise<any> {
		// create a queue or connection instance
		const Queue = new Bull('my-first-queue');
		// get jobs
		// console.log("Normal Jobs",await Queue.getJobs())
		// get repeatable jobs
		console.log("Repeated Jobs", await Queue.getRepeatableJobs())
		// create a job 
		Promise.all([Queue.add(
			'job1', // job-name aka named jobs
			{
				foo: 'bar' //job-data
			},
			{
				jobId: 'jobId-1', // custom jobId
				repeat: { cron: '* * * * *' } // cron expression
			}),
		Queue.add(
			'job2', // job-name aka named jobs
			{
				foo: 'bar2' //job-data
			},
			{
				jobId: 'jobId-2', // custom jobId
				repeat: { cron: '* * * * *' } // cron expression
			})
		])

		// processor can be named or un-named. use '*' as default processor for all jobs 
		Queue.process('*', 1, async (job: any) => {
			console.log("Inside Processor", job.data);
			// do some task
			return doSomething(job.data)
		});

		// some task
		const doSomething = async (data: any) => {
			console.log("Inside the doSomething Method")
			return Promise.resolve(data)
		}

		// listeners for queue
		Queue.on('completed', async (job: any, result: any) => {
			// remove the completed jobs though these jobs aren't repeated but will increase the queue size.
			console.log("removed completed jobs:", await Queue.clean(0, 'completed'));
			console.log(`Job completed with result ${result}`);
		})
	}


	// public stopped: Function = async () => await getConnection().close();
}

module.exports = new JobsService();