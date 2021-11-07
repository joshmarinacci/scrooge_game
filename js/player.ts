import {Point} from "./util.js";
import {GameState} from "./game";

export class Player {
    info:any
    center:Point
    offset:Point
    _type:string
    private image_name: string;
    private state: GameState;
    private frame:number
    private prev:number
    private dir:Point
    constructor(info, state:GameState) {
        this._type = "PLAYER"
        this.info = info
        this.center = new Point(4,7)
        this.offset = new Point(0,0)
        this.image_name = null
        this.state = state
        this.frame = 0
        this.prev = Date.now()
        this.dir = new Point(0,0)
    }
    set_direction(dir:Point) {
        this.dir = dir
    }
    set_image_name(str:string) {
        this.image_name = str
    }
    offset_by(offset:Point) {
        this.offset = this.offset.add(offset)
    }
    set_center(pt:Point) {
        this.center = pt
        this.offset = new Point(0,0)
    }
    normalize() {
        if (this.offset.x <= -16) {
            this.offset.x += 16
            this.center.x -= 1
        }
        if (this.offset.x >= 16) {
            this.offset.x -= 16
            this.center.x += 1
        }
        if (this.offset.y < -16) {
            this.offset.y += 16
            this.center.y -= 1
        }
        if (this.offset.y >= 16) {
            this.offset.y -= 16
            this.center.y += 1
        }
    }
    draw(surf) {
        //draw in the center of the viewport
        let pos = new Point(
            surf.viewport.width_in_tiles / 2,
            surf.viewport.height_in_tiles / 2
        )
        let off = new Point(0,0)

        if(this.image_name) {
            // console.log("dir",this.dir)
            let xy = new Point(this.frame,1)
            let flip = false
            if(this.dir.x === 0 && this.dir.y === -1) {
                xy.y = 1
            }
            if(this.dir.x === 0 && this.dir.y === 1) {
                xy.y = 0
            }
            if(this.dir.x === -1 && this.dir.y === 0) {
                xy.y = 2
                flip = true
            }
            if(this.dir.x === 1 && this.dir.y === 0) {
                xy.y = 2
            }
            let now = Date.now()
            if(now - this.prev > 150) {
                this.frame = (this.frame + 1) % 2
                this.prev = now
            }
            surf.draw_tile(pos,off, xy, this.image_name, flip)
        } else {
            // console.log("other draw")
            surf.draw_tile(pos, off,
                this.info.center,
                this.info.image)
        }
    }
}
