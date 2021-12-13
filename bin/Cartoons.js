#! /usr/bin/env node
const fs = require("fs")
const {getVideoApi,getSlug,getPage,getMainApi}=require("./services")
const yargs = require("yargs")
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const BASE_URL="https://app.opencdn.co/cartoon?id="
const VIDEO_URL = "https://animepl.xyz/api/source/"
const SHOW_URL="https://kisscartoon.city/?s="
const EPISODE_URL="https://kisscartoon.city/movie/"


var MaxEpisodes = 1;
var Slug = ""
var Path = ""

let ep = 1
const arr = []
const fetchEpisode=async ()=>{
    const html = await getPage(EPISODE_URL,Slug,ep)
    const {max,semi} = await getMainApi(MaxEpisodes,html,BASE_URL)
    MaxEpisodes=max
    const {video,quality} = await getVideoApi(VIDEO_URL,semi)
    return {episode:MaxEpisodes-ep+1,url:video,quality:quality}
}
const displayOptions = (arr)=>{
    rl.question("Choose Index : ",(index)=>{

        const splat = arr[index].url.split("/")
        Slug = splat[splat.length-2]

        console.log("Starting To Fetch Every Episode... \n")

        rl.question("Enter File Or Folder Path (file must be .json) : ",(path)=>{
            console.log(path=="")
            if (path==""||path==null||path.includes(" ")) {
                console.log(path)
                Path = "D:/desktop/cartoon.json"
            }else{
                Path=path
            }
            fetchAllTheEpisodes()
        })
    })
}
const fetchAllTheEpisodes=async ()=>
{
    setTimeout(async()=>
    {
        ep<=MaxEpisodes&&console.log(`Fetching Episode ${ep}...`)
        const episode_obj= await fetchEpisode()
        arr.push(episode_obj)
        console.log(`Episode ${ep} Fetched \n`)
        ep++
        if(ep>MaxEpisodes){
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
const getWithYargs = async () =>{
    let show_name=""
    const words = yargs.argv._
    words.map(child=>{
        show_name+=(child+"+")
    })
    const arr = await getSlug(SHOW_URL,show_name.toLowerCase())
    displayOptions(arr)
}
const cli_init = ()=>{
    if(yargs.argv._.length==0)
    {
        rl.question("Enter Cartoon Name : ",async (show_name)=>
        {
            const formated = show_name.replace(" ","+").toLowerCase()
            const arr = await getSlug(SHOW_URL,formated)
            displayOptions(arr)

        })
    }
    else{
        getWithYargs()
    }
}
cli_init(Path,Slug,SHOW_URL)


