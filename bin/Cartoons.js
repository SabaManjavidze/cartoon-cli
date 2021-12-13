#! /usr/bin/env node
const yargs = require("yargs")
const axios = require("axios").default
var HTMLParser = require('node-html-parser');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const fs = require("fs")

require('dotenv').config({path:"C:/Users/Saba/Cartoon_CLI/bin/.env"})

const my_colors = [
    '\x1b[31m%s\x1b[0m',
    '\x1b[32m%s\x1b[0m',
    '\x1b[33m%s\x1b[0m',
    '\x1b[34m%s\x1b[0m',
    '\x1b[35m%s\x1b[0m',
    '\x1b[36m%s\x1b[0m'
]

const url = process.env.SEARCH_URL
const video_url = process.env.VIDEO_URL
var MaxEpisodes = 0;
var Slug = ""
var Path = ""

const getWithYargs = async () =>{
        let show_name=""
        const words = yargs.argv._
        words.map(child=>{
            show_name+=(child+"+")
        })
    const arr = await getSlug(show_name.toLowerCase())
    displayOptions(arr)
}
const displayOptions = (arr)=>{
    rl.question("Choose Index : ",(index)=>{

        const splat = arr[index].url.split("/")
        Slug = splat[splat.length-2]

        console.log("Starting To Fetch Every Episode... \n")

        rl.question("Enter File Or Folder Path (file must be .json) : ",(path)=>{
            Path=path
            fetchAllTheEpisodes()
        })
    })
}
var col_i = 0
const getSlug = async (slug)=>{
    const arr = await getOptions(`${process.env.SHOW_URL}${slug}&x=0&y=0`)
    arr.map((child,i)=>{
        if(col_i>my_colors.length-1){
            col_i=0
        }
        const ran_num = Math.floor(Math.random()*my_colors.length)
        const ran_col = my_colors[ran_num].split("%s")
        const splited=  my_colors[col_i].split("%s")
        const inverse=  my_colors[my_colors.length-1-col_i].split("%s")
        console.log(`${splited[0]}[${i}]${splited[1]}${ran_col[0]}--${ran_col[1]}${inverse[0]}${child.title}${inverse[1]}`)
        col_i+=1
    })
    return arr
}

const getOptions = async (url) =>{
    try {
        console.log("Getting Results... \n")
        const res = await axios.get(url)
        const html = HTMLParser.parse(res.data)
        const arr = html.querySelectorAll(process.env.SELECT_QUERY)
        const data = []
        arr.map(child=>{
            data.push({title:child.attributes["data-jtitle"],url:child.attributes.href})
        })
        return data;

    } catch (error) {
        console.log("getOptions")
    }
}
const getPage=async(ep)=>{
    console.log("33%")
    try{    
        const res = await axios.get(`${process.env.EPISODE_URL}${Slug}-episode-${ep}/`)
        const html = HTMLParser.parse(res.data)
        return html
    }
    catch(err){
        console.log("getPage")
    }
}
const getMainApi=async(html)=>{
    console.log("66%")
    try{    
        const content = html.querySelector("#myframe").attributes.src.split("#")[1]
        MaxEpisodes = html.querySelector("#selectEpisode").getElementsByTagName("option").length
        const item = await axios.get(url+content)
        const semi = item.data.fembed.link.split("/")
        return semi
    }
    catch(err){
        console.log("getMainApi")
    }
}

const getVideoApi= async (semi)=>{
    console.log("99%")
    try{    
        const video = await axios.post(video_url+semi[semi.length-1],{r:"",d:"animepl.xyz"})
        const mp4 = video.data.data[video.data.data.length-1]
        return {video:mp4.file,quality:mp4.label}
    }
    catch(err){
        console.log("getVideoApi")
    }
}

let ep = 1
const arr = []
const fetchAllTheEpisodes=async ()=>
{
    setTimeout(async()=>
    {
        ep<=MaxEpisodes&&console.log(`Fetching Episode ${ep}...`)
        const html = await getPage(ep)
        const semi = await getMainApi(html)
        const {video,quality} = await getVideoApi(semi)
        arr.push({episode:MaxEpisodes-ep+1,url:video,quality:quality})
        console.log(`Episode ${ep} Fetched \n`)
        ep++
        if(ep>MaxEpisodes){
            fs.writeFileSync(
                Path,
                JSON.stringify(arr,null,2),
                {flag:"w+"},
                (err)=>{
                    err&&console.log(err)
                    return
                }
            )
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

if(yargs.argv._.length==0)
{
    rl.question("Enter Cartoon Name : ",async (show_name)=>
    {
        const formated = show_name.replace(" ","+").toLowerCase()
        const arr = await getSlug(formated)
        displayOptions(arr)
    })
}
else{
    getWithYargs()
}

