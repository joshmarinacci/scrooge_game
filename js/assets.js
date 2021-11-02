import {Room} from "./room.js"
const log = (...args) => console.log(...args)

export class AssetManager {
    constructor(data,state) {
        this.data = data
        this.IMAGES = {}
        this.state = state
    }
    async load_images() {
        // log("loading images",this.data.images)
        for (let key of Object.keys(this.data.images)) {
            // log("key is",key)
            this.IMAGES[key] = await this.load_image(this.data.images[key])
        }
    }
    load_image(path) {
        return new Promise((res, rej) => {
            let img = new Image()
            // log("starting to load",path)
            img.addEventListener('load', () => {
                log("finished loading",path,img)
                res(img)
            })
            img.src = path
        })
    }
    async load_room(roomid) {
        let room_info = this.data.maps[roomid]
        log("loading room ", room_info)
        let room_data = await fetch(`./maps/${room_info.path}`).then(res => res.json())
        let room = new Room(room_data)
        log("ROOM is", room)
        log("player will be positioned at", room.data.start)
        return room
    }

}