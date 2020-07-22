const core = require('@actions/core');
const github = require('@actions/github');

async function run()
{
	const github_token = core.getInput('github-token', {required: true});
	const string version = core.getInput('version', {required: true});
	console.log(`Version: ${version}`);
	
	const octokit = github.getOctokit(github_token);
	const context = github.context;
	
	octokit.paginate(.repos.listTags, { ...context.repo },
	(response, done) => 
	{
		//if (response.data.find((issues) => issue.body.includes("something")))
		//{
		//	done();
		//}
		console.log(response.data);
		return response.data;
	});
	
	
	
}

run();