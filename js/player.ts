import {Point} from "./util.js";

export class Player {
    info:any
    center:Point
    offset:Point
    constructor(info) {
        this.info = info
        this.center = new Point(4,7)
        this.offset = new Point(0,0)
    }
    offset_by(offset:Point) {
        this.offset = this.offset.add(offset)
    }
    set_center(pt:Point) {
        this.center = pt
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
        surf.draw_tile(
            //draw in the center of the viewport
            {
                x: surf.viewport.width_in_tiles / 2,
                y: surf.viewport.height_in_tiles / 2
            },
            { x: 0, y: 0 },
            this.info.center,
            this.info.image)
    }
}
