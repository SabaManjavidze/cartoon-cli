#! /usr/bin/env node

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var nconf = require('nconf');
nconf.use('file',{file:"../settings.json"})
nconf.load()
const fs = require("fs")
const {getVideoApi,getSlug,getPage,getMainApi}=require("./services")


const yargs = require('yargs');
const argv = yargs.argv
const GivenTitle = argv._


const cli_init =async ()=>{
    if (argv.path!=null) {
       nconf.set("path",argv.path)
       nconf.save((err)=>{
        if (err) {
            console.error(err.message);
            return;
          }
       })
    }
    if(GivenTitle.length==0)
        {
            rl.question("Enter Cartoon Name : ",async (show_name)=>
            {
                const formated = show_name.replace(" ","+").toLowerCase()
                const arr = await getSlug(SHOW_URL,formated)
                displayOptions(arr)

            })
        }
        else{
            getWithYargs(argv.specify)
        }
    }

const getWithYargs = async (specify)=>{
    let show_name=""

    GivenTitle.map(child=>{
        show_name+=(child+"+")
    })
    const arr = await getSlug(SHOW_URL,show_name.toLowerCase())
    displayOptions(arr,specify)
}


const BASE_URL="https://app.opencdn.co/cartoon?id="
const VIDEO_URL = "https://animepl.xyz/api/source/"
const SHOW_URL="https://kisscartoon.city/?s="
const EPISODE_URL="https://kisscartoon.city/movie/"


var MaxEpisodes = 1;
var Slug = ""
var Path = nconf.get("path")
let ep = 1
const arr = []

const fetchEpisode=async ()=>{
    const html = await getPage(EPISODE_URL,Slug,ep)
    const {max,semi} = await getMainApi(MaxEpisodes,html,BASE_URL)
    MaxEpisodes=max
    const {video,quality} = await getVideoApi(VIDEO_URL,semi)
    return {episode:MaxEpisodes-ep+1,url:video,quality:quality}
}
const displayOptions = (arr,specify)=>{
    rl.question("Choose Index : ",(index)=>{

        const splat = arr[index].url.split("/")
        Slug = splat[splat.length-2]

        console.log("Starting To Fetch Every Episode... \n")
        if(specify){
            rl.question("Enter File Or Folder Path (file must be .json) : ",(path)=>{
                Path=path
                fetchAllTheEpisodes()
            })
        }else{
            fetchAllTheEpisodes()
        }   
    })
}
const fetchAllTheEpisodes=async ()=>
{
    setTimeout(async()=>
    {
        ep<=MaxEpisodes&&console.log(`Fetching Episode ${ep}...`)
        const episode_obj= await fetchEpisode()
        arr.push(episode_obj)
        console.log('\x1b[32m%s\x1b[0m',`Episode ${ep} Fetched \n`)
        ep++
        if(ep>MaxEpisodes){
            const path_arr = Path.split("/")
            const path_dir=Path.replace(path_arr[path_arr.length-1],"")
            if (!fs.existsSync(path_dir)) {
               fs.mkdirSync(path_dir,{recursive:true}) 
            }
            fs.writeFileSync(Path,JSON.stringify(arr,null,2),{flag:"w+"},(err)=>{err&&console.log(err);return})
            console.log("Done!")
            return;
        }
        if(ep<=MaxEpisodes)
        {
            fetchAllTheEpisodes()
        } 
    }
    ,2500
    )
}
cli_init()


