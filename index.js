const core = require('@actions/core');
const github = require('@actions/github');
const github_token = core.getInput('github-token', {required: true});
const octokit = github.getOctokit(github_token);
const context = github.context;

const version = core.getInput('version', {required: true});
console.log(`Version: ${version}`);


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
	}
	else
	{
		console.log('Creating release');
		release = await octokit.repos.createRelease(
		{
			...context.repo,
			tag_name: version
		});
	}
	
	
	
	const assets = core.getInput('assets');
	if(assets)
	{
		var curAssets = await octokit.paginate(octokit.repos.listReleaseAssets, { ...context.repo, release_id: release.Id },
		(response) => 
		{
			console.log(response.data);
		});
		
		const jsonAssets = JSON.parse(assets);
		        
    };
	//Upload assets
	/*
		releaseId = result.data.id;

        return octokit.request({
          method: "POST",
          url: result.data.upload_url,
          headers: {
            "content-type": "text/plain",
          },
          data: "Hello, world!\n",
          name: "test-upload.txt",
          label: "test",
        });	
	
	*/
	
}

run();



