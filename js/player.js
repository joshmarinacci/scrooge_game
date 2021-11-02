export class Player {
    constructor(info) {
        this.info = info
        // log("player info is", this.info)
        // log("player image is", IMAGES[this.info.image])
        this.center = {
            x: 4,
            y: 7,
        }
        this.offset = {
            x: 0,
            y: 0,
        }
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
