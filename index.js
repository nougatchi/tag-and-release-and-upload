const core = require('@actions/core');
const github = require('@actions/github');
const github_token = core.getInput('github-token', {required: true});
const version = core.getInput('version', {required: true});
console.log(`Version: ${version}`);

const octokit = github.getOctokit(github_token);
const context = github.context;


async function run()
{
	//Create the tag if it doesn't exist
	var tag_exists = await octokit.paginate(octokit.repos.listTags, { ...context.repo },
	(response, done) => 
	{
		if (response.data.find((tag) => tag.name == version))
		{
			done();
			return true;
		}
		return false;
	});

	if(tag_exists)
	{
		console.log('Tag already exists');
	}
	else
	{
		console.log('Creating tag');
		await octokit.git.createRef(
		{ 
			...context.repo, 
			ref: `refs/tags/${version}`, 
			sha: context.sha 
		});
	}		


	//Create the release if it doesn't exist
	var release = await octokit.repos.getReleaseByTag(
	{
	  ...context.repo,
	  tag: version
	})
	.then(data => { return data })
	.catch(() => { return null });

	if(release)
	{
		console.log('Release already exists');
		console.log(release)
	}
	else
	{
		console.log('Creating release');
		await octokit.repos.createRelease(
		{
			...context.repo,
			tag_name: version
		});
	}
	
	
}

run();



