const axios = require("axios").default
var HTMLParser = require('node-html-parser');

const my_colors = [
    '\x1b[31m%s\x1b[0m',
    '\x1b[32m%s\x1b[0m',
    '\x1b[33m%s\x1b[0m',
    '\x1b[34m%s\x1b[0m',
    '\x1b[35m%s\x1b[0m',
    '\x1b[36m%s\x1b[0m'
]
var col_i = 0
const getSlug = async (SHOW_URL,slug)=>{
    const arr = await getOptions(`${SHOW_URL}${slug}&x=0&y=0`)
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
        const arr = html.querySelectorAll(".item_movies_in_cat > div > .title_in_cat_container > a")
        const data = []
        arr.map(child=>{
            data.push({title:child.attributes["data-jtitle"],url:child.attributes.href})
        })
        return data;

    } catch (error) {
        console.log("getOptions")
    }
}

const getVideoApi= async (VIDEO_URL,semi)=>{
    console.log("99%")
    try{    
        const video = await axios.post(VIDEO_URL+semi[semi.length-1],{r:"",d:"animepl.xyz"})
        const mp4 = video.data.data[video.data.data.length-1]
        return {video:mp4.file,quality:mp4.label}
    }
    catch(err){
        console.log("getVideoApi")
    }
}

const getPage=async(EPISODE_URL,Slug,ep)=>{
    console.log("33%")
    try{    
        const res = await axios.get(`${EPISODE_URL}${Slug}-episode-${ep}/`)
        const html = HTMLParser.parse(res.data)
        return html
    }
    catch(err){
        console.log("getPage")
    }
}



 const getMainApi=async(max_episodes,html,BASE_URL)=>{
    console.log("66%")
    try{    
        console.log(html)
        const content = html.querySelector("#myframe").attributes.src.split("#")[1]
        max_episodes = html.querySelector("#selectEpisode").getElementsByTagName("option").length
        const item = await axios.get(BASE_URL+content)
        const semi = item.data.fembed.link.split("/")
        return {max:max_episodes,semi:semi}
    }
    catch(err){
        console.log("getMainApi")
    }
}

module.exports={getMainApi,getSlug,getVideoApi,getMainApi,getPage}