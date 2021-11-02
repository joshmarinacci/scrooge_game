
export class Room {
    constructor(data) {
        this.data = data
        this.draw_blocking = false
    }
    log(...args) {
        console.log("Room", ...args)
    }
    draw(surf) {
        let ctx = surf.ctx
        surf.fill(this.data.background)
        //ctx.fillRect(0, 0, this.data.width * surf.tile_width * surf.scale, this.data.height * surf.tile_height * surf.scale)
        ctx.save()
        ctx.translate(surf.state.scroll.x * surf.scale, surf.state.scroll.y * surf.scale)
        this.data.layers.forEach(layer => this.drawLayer(surf, layer))
        ctx.restore()
    }
    is_blocking(surf,x,y) {
        this.log('checking if blocking at',x,y)
        let blocking = false
        this.data.layers.forEach(layer => {
            if(layer.type === 'drawn') {
                let n = x + y*layer.width
                this.log("n is",n)
                let target = layer.data[n]
                this.log('target is',target)
                let tile = this.lookup_master_tile(surf,target)
                this.log("tile is",tile)
            }
        })
        return blocking
    }
    lookup_master_tile(surf,info) {
        let group = info.master.group
        let id = info.master.id
        let tg = surf.tilegroups[group]
        let tile = tg.tiles[id]
        return tile
    }
    tile_info_at_pixel(surf,xy) {
        // this.log('checking if blocking as',xy)
        let infos = []
        this.data.layers.forEach(layer => {
            if(layer.type === 'drawn') {
                let n = xy.x + xy.y*layer.width
                // this.log("n is",n)
                let target = layer.data[n]
                // this.log('target is',target)
                let tile = this.lookup_master_tile(surf,target)
                // this.log("tile is",tile)
                tile.type = 'tile'
                infos.push(tile)
            }
            if(layer.type === 'item') {
                // this.log('checking item',layer)
                layer.data
                    .filter(info => info.x == xy.x && info.y == xy.y)
                    .forEach(info => {
                        // console.log("info is",info)
                        info.type = 'item'
                        infos.push(info)
                    })
                    // .map(info => {
                    //     return this.lookup_master_item(surf,info)
                    // })
                    // .map(info => {
                    //     info.blocking = true
                    //     return info
                    // })
            }
        })
        return infos
    }
    lookup_master_item(surf,info) {
        let group = info.master.group
        let itemid = info.master.id
        let tg = surf.data.objectgroups[group]
        return tg.objects.find(o => o.name == itemid)
    }
    drawLayer(surf, layer) {
        if (layer.visible == false) return
        if (layer.type === 'item') {
            layer.data.forEach((info, n) => {
                let x = info.x
                let y = info.y
                let item_def = this.lookup_master_item(surf,info)
                surf.draw_tile({ x, y }, { x: 0, y: 0 }, item_def.center, item_def.image)
            })
        }
        if (layer.type === 'drawn') {
             layer.data.forEach((info, n) => {
                if (!info) return
                let x = n % layer.width
                let y = Math.floor(n / layer.width)
                let tile = this.lookup_master_tile(surf,info)
                surf.draw_tile({ x, y }, { x: 0, y: 0 }, tile.center, tile.image)
                if(tile.blocking && this.draw_blocking) {
                    surf.ctx.strokeStyle = 'red'
                    surf.ctx.strokeRect(
                        x * surf.tile_width * surf.scale,
                        y * surf.tile_height * surf.scale,
                        surf.tile_width * surf.scale,
                        surf.tile_height * surf.scale
                    )
                }
            })
        }
    }
}
