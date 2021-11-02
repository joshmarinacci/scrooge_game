export class Surface {
    constructor(STATE, assets,data) {
        this.data = data
        this.tilegroups = data.tilegroups
        this.canvas = document.createElement('canvas')
        this.canvas.width = 700
        this.canvas.height = 600
        document.body.appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false
        this.tile_width = 16
        this.tile_height = 16
        this.scale = 4
        this.state = STATE
        this.assets = assets
        this.tile_groups = []
        this.viewport = {
            width_in_tiles: 8,
            height_in_tiles: 8,
        }
    }
    clear() {
        this.ctx.fillStyle = 'green'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    fill(color) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    draw_tile(position, offset, tile_center, imageid) {
        //log('drawing a tile at ',center, 'from tile',info,'from image',imageid)
        let image = this.assets.lookup_image(imageid)
        let sx = tile_center.x * this.tile_width
        let sy = tile_center.y * this.tile_height
        let sw = this.tile_width
        let sh = this.tile_height
        let dx = (position.x * this.tile_width + offset.x) * this.scale
        let dy = (position.y * this.tile_height + offset.y) * this.scale
        let dw = this.tile_width * this.scale
        let dh = this.tile_height * this.scale
        this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
    }
    stroke_pixel_rect(x, y, w, h, color) {
        this.ctx.strokeStyle = color
        this.ctx.strokeRect(
            x * this.scale,
            y * this.scale,
            w * this.scale,
            h * this.scale,
        )
    }
}


export class DebugOverlay {
    constructor(state) {
        this.state = state
    }
    draw(surf) {
        surf.ctx.fillStyle = 'cyan'
        surf.ctx.fillRect(0, 0, 100, 30)
        surf.ctx.fillStyle = 'black'
        surf.ctx.fillText(`scroll ${this.state.scroll.x} , ${this.state.scroll.y}`, 2, 10)
        surf.ctx.fillText(`player center ${this.state.PLAYER.center.x} , ${this.state.PLAYER.center.y}`, 2, 20)
        surf.ctx.fillText(`player offset ${this.state.PLAYER.offset.x} , ${this.state.PLAYER.offset.y}`, 2, 30)

        // draw location of player
        let player = this.state.PLAYER
        surf.stroke_pixel_rect(
            player.center.x * surf.tile_width + this.state.scroll.x,
            player.center.y * surf.tile_height + this.state.scroll.y,
            surf.tile_width,
            surf.tile_height,
            'magenta',
        )

        surf.stroke_pixel_rect(0, 0,
            surf.viewport.width_in_tiles * surf.tile_width,
            surf.viewport.height_in_tiles * surf.tile_height,
            'red'
        )

        surf.stroke_pixel_rect(
            this.state.test_tile.x * surf.tile_width + this.state.scroll.x,
            this.state.test_tile.y * surf.tile_height + this.state.scroll.y,
            surf.tile_width,
            surf.tile_height,
            'green'
        )

    }
}
