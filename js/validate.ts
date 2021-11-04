import {promises as fs,createReadStream} from 'fs'
import {decodePNGFromStream} from "pureimage"
import * as path from "path";

type Stats = {
    scripts: number;
    dialog: number;
    actions: number;
    images:number,
    maps:number,
}

type Cache = {
    maps: Map<string, any>;
}

async function exists(pth) {
    try {
        await fs.stat(pth)
        return true
    } catch (e) {
        return false
    }
}

const log = (...args) => console.log(...args)
const warn = (...args) => console.warn("===========\n### ",...args)


async function check_images(stats:Stats, data: any) {
    stats.images = Object.keys(data.images).length
    for (let img_name of Object.keys(data.images)) {
        let pth = data.images[img_name]
        log(img_name, pth)
        // log(`image ${img_name} path = ${pth}  exists = ${ await exists(pth)}`)
        if (!(await exists(pth))) {
            warn(`image ${img_name} at path ${pth} not found!`)
        } else {
            let stream = createReadStream(pth)
            let bitmap = await decodePNGFromStream(stream)
            log("bitmap is",bitmap.width, bitmap.height)
        }
    }
}

function find_item_in_map(item_id: string, map: any) {
    let found_item = null
    map.layers.forEach(layer => {
        if(layer.type === 'item') {
            layer.data.forEach(item => {
                // log('checking', item.settings.id.value)
                if(item.settings.id.value === item_id) found_item = item
            })
        }
    })
    return found_item
}

function validate_goto_action(act:any, cache: Cache) {
    // log("validating action",act)
    //does target room exist
    let room = act.gotoroom.map
    if(!cache.maps.has(room)) return warn(`action ${act.id} references missing map: ${room}`)
    let map = cache.maps.get(room)
    //does item exist in the target room?
    let item = find_item_in_map(act.gotoroom.item, map)
    if(!item) {
        warn(`action references an item '${act.gotoroom.item}' that isn't in the map '${room}'`)
    } else {
        // log("found item",item.settings.id.value)
    }


    //is dx dy specified
    //would dx dy relative to the item put us outside the map?
}

async function check_maps(stats:Stats, data: any, cache:Cache) {
    stats.maps = Object.keys(data.maps).length
    for (let map_key of Object.keys(data.maps)) {
        let map_info = data.maps[map_key]
        // log('map',map_key)
        //check we can load it
        let map = JSON.parse((await fs.readFile(path.join('maps',map_info.path))).toString())
        // log("real map is",map)
        //check that IDs are the same
        if(map_info.id !== map.id) warn(`map has incorrect id ${map_info.id}`)
        if(!map.background) warn(`map is missing background field ${map_info.id}`)
        cache.maps.set(map.id,map)
        map.actions.forEach(act => {
            stats.actions += 1
            if(act.type === 'script') {
                stats.scripts += 1
            }
            if(act.type === 'dialog') {
                stats.dialog += act.dialog.length
            }
        })
    }
}

async function check_actions(stats: Stats, cache: Cache) {
    for(let map of cache.maps.values()) {
        map.actions.forEach(act => {
            if(act.type === 'gotoroom') validate_goto_action(act,cache)
        })
    }

}

async function validate() {
    let data = JSON.parse((await fs.readFile("./config.json")).toString())
    // console.log('data is',data)

    let stats:Stats = {
        scripts: 0,
        dialog: 0,
        maps: 0,
        images: 0,
        actions:0
    }
    let cache:Cache = {
        maps: new Map()
    }
    await check_images(stats,data)
    await check_maps(stats,data,cache)
    await check_actions(stats,cache)

    console.log('stats',stats)
}

validate().then(()=>console.log("done")).catch((e)=>console.log(e))
