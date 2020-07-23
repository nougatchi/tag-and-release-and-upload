const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const github_token = core.getInput('github-token', {required: true});
const octokit = github.getOctokit(github_token);
const context = github.context;

const version = core.getInput('version', {required: true});
console.log(`Version: ${version}`);

async function run()
{
	try
	{
		await run_inner();
	}
	catch (error)
	{
		core.setFailed(error.message);
	}
}

async function run_inner()
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
	})
	.catch(() => { return false });

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
	}
	else
	{
		console.log('Creating release');
		release = await octokit.repos.createRelease(
		{
			...context.repo,
			tag_name: version,
			name: version,
			target_commitish: context.sha
		});
	}
	
	console.log(release);
	
	const assets = core.getInput('assets');
	if(assets)
	{
		const newAssets = JSON.parse(assets);

		const currAssets = await octokit.paginate(octokit.repos.listReleaseAssets, { ...context.repo, release_id: release.Id })
		.catch(() => {return null });
		
		console.log(currAssets);
		
		//if(currAssets)
		//{
			
		//}
		//else
		//{
			// Upload all newAssets
			
		//}
		
		for(var i in newAssets)
		{
			var newAsset = newAssets[i];
			console.log(newAsset);
			if (!fs.existsSync(newAsset))
				throw new Error(`${newAssets} file not found`);
			
			var headers = { 'content-type': 'application/zip', 'content-length': fs.statSync(newAsset).size };
			console.log(headers);
			
			//await octokit.repos.uploadReleaseAsset
			//({
			//	url: release.upload_url,
			//	headers,
			//	name: newAsset,
			//	file: fs.readFileSync(newAsset)
			//});
	
		}
		        
    };
	
	
	
	
}

run();



