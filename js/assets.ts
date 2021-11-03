import {Room} from "./room.js"
const log = (...args) => console.log(...args)

export class AssetManager {
    private data: any;
    private images: {};
    private state: any;
    private rooms: {};
    constructor(data,state) {
        this.data = data
        this.images = {}
        this.state = state
        this.rooms = {}
    }
    async load_images() {
        for (let key of Object.keys(this.data.images)) {
            this.images[key] = await this.load_image(this.data.images[key])
        }
    }
    load_image(path) {
        return new Promise((res, rej) => {
            let img = new Image()
            img.addEventListener('load', () => res(img))
            img.src = path
        })
    }
    lookup_image(imageid) {
        return this.images[imageid]
    }
    async load_room(roomid) {
        let room_info = this.data.maps[roomid]
        let room_data = await fetch(`./maps/${room_info.path}`).then(res => res.json())
        // console.log("room data is",room_data)
        room_data.layers.forEach(layer => {
            if(layer.type === 'item') {
                // log("item layer",layer)
                layer.data.forEach(item => {
                    // log("item is",item)
                })
            }
        })
        //mark all items as visible
        this.rooms[roomid] = new Room(room_data)
        return this.rooms[roomid]
    }

}
