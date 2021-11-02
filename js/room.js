
export class Room {
    constructor(data) {
        this.data = data
    }
    draw(surf) {
        let ctx = surf.ctx
        surf.fill(this.data.background)
        ctx.fillRect(0, 0, this.data.width * surf.tile_width * surf.scale, this.data.height * surf.tile_height * surf.scale)
        ctx.save()
        ctx.translate(surf.state.scroll.x * surf.scale,surf.state.scroll.y * surf.scale)
        this.data.layers.forEach(layer => this.drawLayer(surf, layer))
        ctx.restore()
    }
    drawLayer(surf, layer) {
        if (layer.type !== 'drawn') return
        if (layer.visible == false) return
        let ctx = surf.ctx
        layer.data.forEach((info, n) => {
            if (!info) return
            let x = n % layer.width
            let y = Math.floor(n / layer.width)
            let group = info.master.group
            let id = info.master.id
            let tg = surf.tilegroups[group]
            let tile = tg.tiles[id]
            let imageid = tile.image
            surf.draw_tile({ x, y }, {x:0, y:0}, tile.center, imageid)
        })
    }
}
