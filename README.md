# Tag and release and upload
Creates a tag, release, and uploads assets based on the version string specified. But there are already dozens of these, including ones created by GitHub, right?  Well I did ths for 2 reasons. 

 1. To learn how to build GitHub workflows and actions
 2. This doesn't fail if something already exists! The logic is:
    - Check for existing tag
    - Create it if it doesn't exist
    - Check for existing release for the tag
    - Create it if it doesn't exit
    - Check for each specified asset in the release
    - Upload it if it doesn't exist

I designed this to work with the actions [AssemblyInfo Version](https://github.com/marketplace/actions/assemblyinfo-version) and [.Net SDK Project file Version](https://github.com/marketplace/actions/net-sdk-project-file-version). The idea is if I want a new release, I can change the assembly version attribute in my Visual Studio project, and push.  This will create a new release when the version number changes, but will do nothing if the version already exists (instead of failing).

## Usage
Create new `.github/workflows/my-workflow.yml` file:

```yml
name: .NET Core
on:
  push:
    branches: [ master ]
  pull_requests:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup .NET Core
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: 3.1.101

      - name: Build
        run: |
          dotnet build -c Release
          zip -r binaries.zip ./MyProject/bin/release/netcoreapp3.1
          zip -r otherstuff.zip ./otherstuff
          
      # Get the assembly version, use this as the tag.
      # That way, to do a new release, just update the assembly version on the next commit
      - name: Get Assembly Version
        id: get_version
        uses: jasondavis303/net-sdk-proj-file-version
        with: 
          PROJ_FILE: MyProject/MyProject.csproj        
      
      - name: Tag and Release
        uses: jasondavis303/tag-and-release-and-upload
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          
          # Use the version from the previous step (it outputs with a 'v' prefix: v1.2.3)
          version: ${{ steps.get_version.outputs.ASSEMBLY_VERSION }}
          
          
          assets: '[ "binaries.zip", "otherstuff.zip" ]'
```

## Inputs

Input | Description
--- | ---
github-token | Needed to create tags, releases and uploads
version | Version of the tag/release to create
assets | Optional: json array of filenames to upload, relative to the root of the repository
