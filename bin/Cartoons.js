#! /usr/bin/env node

const readline = require('readline-sync');
var nconf = require('nconf');
nconf.use('file',{file:"../settings.json"})
nconf.load()
const fs = require("fs")
const axios = require("axios").default
const {getVideoApi,getSlug,getPage,getMainApi}=require("./services")

const yargs = require('yargs').options({
    "autofolder":{
        alias: 'af',
        description:'creates folder with title of the show as its name in dir specified in settings.json',
        type:'boolean'
    },
    "download":{
        alias:"d",
        description:"if true downloads mp4 of the episode if false puts url of the mp4 in json file",
        type:"boolean"
    },
    "specify":{
        type:"string"
    }
})
const argv = yargs.argv
const GivenTitle = argv._
const _cliProgress = require('cli-progress');
var ChosenTitle = ""
var MaxEpisodes = 1;
var Slug = ""
var Path = nconf.get("path")
var AutoFolder = nconf.get("autoFolder")
const arr = []

const invalid_answer = ()=>{
        const ans = readline.question("invalid answer, try again. [y,n] : ")
        if(ans!="y"&&ans!="n"){
            invalid_answer()
        }
        return ans
}
const dealWithNoValue = (val)=>{
    if(val!=null&&val!=""){
        return val
    }else{
        no_value()
    }
}
const no_value = async () =>{
    const val = readline.question("--specify needs a value (ex. D:/desktop/cartoons) : ")
        if(val==""||val==null){
            const new_val = dealWithNoValue(val)
            return new_val
        }
        return val
}
const cli_init =async ()=>{
    if (argv.path!=null) {
       const prevPath = nconf.get("path") 
       nconf.set("path",argv.path)
       Path = argv.path
       nconf.save((err)=>{
        if (err) {
            console.error(err.message);
            return;
          }
       })
       console.log(`default path changed from \x1b[33m${prevPath}\x1b[0m to \x1b[32m${argv.path}\x1b[0m`)
    }
    if (!fs.existsSync(Path)) {
        fs.mkdirSync(Path,{recursive:true}) 
    }
    if(argv.autofolder!=null){
       nconf.set("autoFolder",argv.autofolder)
       AutoFolder = argv.autofolder
       nconf.save((err)=>{
        if (err) {
            console.error(err.message);
            return;
          }
        })
    }



    if(argv.specify!=null)
    {
        let specify = argv.specify
        if(specify===""){
            specify = await no_value()
        }

        if(!fs.existsSync(specify))
        {
            const ans = readline.question(`directory ${specify} doesn't exists, do you want to create it?[y,n] : `)
            let answer = ans
            if(ans!="y"&&ans!="n"){
                answer = invalid_answer()
            }
            if(answer=="y"){
                fs.mkdirSync(specify,{recursive:true})
            }else{
                console.log("Using default directory ",Path)
                startDisplayOptions()
            }
            console.log("made directory ",specify)
        }
        Path = specify
    }


    if(argv.download!=null){
        nconf.set("download",argv.download)
        nconf.save((err)=>{
            if (err) {
                console.error(err.message);
                return;
              }
        })
        argv.download
        ?
        console.log("\x1b[35m episodes will be downloaded \x1b[0m")
        :
        console.log("\x1b[35m info of episodes will be written in json file \x1b[0m")
    }
    startDisplayOptions()
}
const startDisplayOptions = async ()=>{
    if(GivenTitle.length==0)
    {
            const show_name= readline.question("Enter Cartoon Name : ")
            const formated = show_name.replace(" ","+").toLowerCase()
            const arr = await getSlug(formated)
            displayOptions(arr)
    }
    else
    {
        getWithYargs()
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



const displayOptions = async (arr,specify)=>{
        const index = readline.question("Choose Index : ")
        
        const splat = arr[index].url.split("/")
        ChosenTitle = arr[index].title
        Slug = splat[splat.length-2]
        const Download = nconf.get("download")
        MaxEpisodes = await getMaxEp()
        if(specify){
            const path=readline.question("Enter file path (file must be .json) : ")
            Path=path
        }
        if(Download)
        {
            const range = readline.question("Enter Episode Range (ex. 4,6) : ")
            if(range!=null&&range!=="")
            {
                const str_arr = range.replace(" ","").split(",")
                const ep_range= [parseInt(str_arr[0]),parseInt(str_arr[1])]
                console.log("Starting To Fetch Every Episode... \n")
                downloadEpisodes(ep_range)
            }
            else
            {
                console.log("Starting To Fetch Every Episode... \n")
                downloadEpisodes([1,MaxEpisodes])
            }
        }
        else{
            fetchAllTheEpisodes()
        }
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


const getMaxEp = async ()=>{
    const html = await getPage(Slug,1)
    const {max} = await getMainApi(html)
    console.log(`Episode Range --- [1-${max}]`)
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
    ep<=max&&console.log(`Fetching Episode ${ep}...`)
    
    const {url}= await fetchEpisode(MaxEpisodes-ep+1)
    const file = fs.createWriteStream(`${Path}/${ChosenTitle}_EP${ep<10?" 0"+ep:" "+ep}.mp4`)
    let receivedBytes = 0

    const progressBar = new _cliProgress.SingleBar({
        format: '{bar} {percentage}% | ETA: {eta}s'
    }, _cliProgress.Presets.shades_classic);


    const stream = await axios.get(url,{responseType:"stream"})
    const totalBytes = stream.headers['content-length'];
    progressBar.start(totalBytes, 0);
    stream.data.on('data', (chunk) => {
        receivedBytes += chunk.length;
        progressBar.update(receivedBytes);
    })
    .pipe(file)
    .on("finish",()=>{
        progressBar.stop()
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
    })

}
cli_init()


