const { default: axios } = require("axios");
const { writeFile } = require("fs");
const mkdirp = require('mkdirp')

const createVersionsFile = (versionsObject = {}, folder) => {
    const versionsJson = JSON.stringify(versionsObject);
    const dirName = __dirname
    mkdirp(`${dirName}/${folder}`).then(made =>
        writeFile(`${made}/version.json`, versionsJson, 'utf8', (err) =>{
            if(err){
                console.error("Fail on creating version.json file. " + err)
            }else{
                console.log("File " + folder +"/version.js successfully created." )
            }
        })
    )
}

const getVersions = async (repo) => {

    let arr = [];
    const versions = await axios.get(repo);

    if(versions && versions.data){
        versions.data.forEach(element => {
            arr.push({
                url: element.html_url,
                tag_name: element.tag_name,
                name: element.name,
                prerelease: element.prerelease,
                created_at: Date.parse(element.created_at),
                published_at: Date.parse(element.published_at)
            })
        });
    }

    return arr;
}

const buildVersions = (versions) => {

    let finalVersion = {}

    versions.sort((a,b) => a.published_at - b.published_at)
    versions.reverse()

    finalVersion["versions"]    = versions
    finalVersion["lastRelease"] = versions.find(el => !el.prerelease)
    finalVersion["lastDev"]     = versions.find(el => el.prerelease)

    return finalVersion;
}

const fetchVersions = (project, repo, folder) => {

    console.log(`Creating version file for ${project}.`)

    getVersions(repo).then(versions => {
        const versionsObject = buildVersions(versions);
        createVersionsFile(versionsObject, folder);
    })
}


fetchVersions("crucible", "https://api.github.com/repos/CrucibleMC/Crucible/releases", "crucible");