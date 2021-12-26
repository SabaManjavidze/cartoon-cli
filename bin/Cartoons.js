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
const axios = require("axios").default
const {getVideoApi,getSlug,getPage,getMainApi}=require("./services")


const yargs = require('yargs');
const argv = yargs.argv
const GivenTitle = argv._
var ChosenTitle = ""


const cli_init =async ()=>{
    if (argv.path!=null) {
       const prevPath = nconf.get("path") 
       nconf.set("path",argv.path)
       nconf.save((err)=>{
        if (err) {
            console.error(err.message);
            return;
          }
       })
       console.log(`default path changed from \x1b[33m${prevPath}\x1b[0m to \x1b[32m${argv.path}\x1b[0m`)
    }
    if(argv.download!=null){
        nconf.set("download",argv.download.toLowerCase())
        nconf.save((err)=>{
            if (err) {
                console.error(err.message);
                return;
              }
        })
        argv.download.toString()=="true"
        ?
        console.log("\x1b[35m episodes will be downloaded \x1b[0m")
        :
        console.log("\x1b[35m info of episodes will be written in json file \x1b[0m")
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
            getWithYargs(argv.specify,argv.download)
        }
    }

const getWithYargs = async (specify)=>{
    let show_name=""

    GivenTitle.map(child=>{
        show_name+=(child+"+")
    })
    const arr = await getSlug(show_name.toLowerCase())
    displayOptions(arr,specify)
}


const SHOW_URL="https://kisscartoon.city/?s="


var MaxEpisodes = 1;
var Slug = ""
var Path = nconf.get("path")
const arr = []


const displayOptions = (arr,specify)=>{
    rl.question("Choose Index : ",async (index)=>{
        
        const splat = arr[index].url.split("/")
        ChosenTitle = arr[index].title
        Slug = splat[splat.length-2]
        const Download = nconf.get("download")=="true"
        MaxEpisodes = await getMaxEp(1)
        if(specify){
            rl.question("Enter file path (file must be .json) : ",(path)=>{
                Path=path
            })
        }
        if(Download)
        {
            rl.question("Enter Episode Range (ex. 4,6) : ",(range)=>{
                if(range!=null||range!=""){
                    const str_arr = range.replace(" ","").split(",")
                    const ep_range= [parseInt(str_arr[0]),parseInt(str_arr[1])]
                    downloadEpisodes(ep_range)
                }else{
                    downloadEpisodes(1,MaxEpisodes)
                }
                console.log("Starting To Fetch Every Episode... \n")
            })
        }
        else{
            fetchAllTheEpisodes()
        }
    })
}
const fetchAllTheEpisodes=async (ep)=>
{
    setTimeout(async()=>
    {
        ep<=MaxEpisodes&&console.log(`Fetching Episode ${ep}...`)
        const episode_obj= await fetchEpisode(MaxEpisodes-ep+1)
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
            fetchAllTheEpisodes(ep+1)
        } 
    }
    ,2500
    )
}

const downloadEpisode=async (url,ep)=>{
    const res = await axios({
        method:"GET",
        url:url,
        responseType:"stream"
    })
    if (!fs.existsSync(Path)) {
        fs.mkdirSync(Path,{recursive:true}) 
    }
    
    res.data.pipe(fs.createWriteStream(`${Path}/${ChosenTitle}_EP${ep<10?" 0"+ep:" "+ep}.mp4`))
}
const getMaxEp = async (ep)=>{
    const html = await getPage(Slug,ep)
    const {max} = await getMainApi(html)
    console.log(max)
    return max
}
const fetchEpisode=async (ep)=>{
    const html = await getPage(Slug,ep)
    const {max,semi} = await getMainApi(html)
    MaxEpisodes=max
    const {video,quality} = await getVideoApi(semi)
    return {episode:ep,url:video,quality:quality}
}

const downloadEpisodes=async (Ep_range)=>
{
    const ep=Ep_range[0]
    const max = Ep_range[1]
    setTimeout(async()=>
    {
        ep<=max&&console.log(`Fetching Episode ${ep}...`)
        const {url}= await fetchEpisode(MaxEpisodes-ep+1)
        downloadEpisode(url,ep)
        console.log('\x1b[32m%s\x1b[0m',`Episode ${ep} Fetched \n`)
        if(ep===max){

            console.log("Done!")
            return;
        }
        if(ep<=Ep_range[1])
        {
            const next_ep = Ep_range[0]+1
            const ep_range = [next_ep,max]
            downloadEpisodes(ep_range)
        } 
    }
    ,2500
    )
}
cli_init()


