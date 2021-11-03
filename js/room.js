
export class Room {
    constructor(data) {
        this.data = data
        this.draw_blocking = true
        this.draw_items = true
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
        let infos = []
        this.data.layers.forEach(layer => {
            if(layer.type === 'drawn') {
                let n = xy.x + xy.y*layer.width
                let target = layer.data[n]
                if(!target) return
                let tile = this.lookup_master_tile(surf,target)
                tile.type = 'tile'
                infos.push(tile)
            }
            if(layer.type === 'item') {
                layer.data
                    .filter(info => info.x == xy.x && info.y == xy.y)
                    .forEach(info => {
                        info.type = 'item'
                        infos.push(info)
                    })
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
                if(info.settings.visible) {
                    if(info.settings.visible.value === false) {
                        return
                    }
                }
                let x = info.x
                let y = info.y
                let item_def = this.lookup_master_item(surf,info)
                surf.draw_tile({ x, y }, { x: 0, y: 0 }, item_def.center, item_def.image)
                if(this.draw_items) {
                    // console.log('drawing ',info.settings.id.value)
                    if(info.settings.id) {
                        surf.debug_text({x,y},{x:2,y:2},info.settings.id.value)
                    }
                    if(info.settings.lockable) {
                        surf.debug_text({x,y},{x:2, y:10+2},
                            `locked: ${info.settings.locked.value}`)
                    }
                }
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
    lookup_action_for_item(itemid) {
        return this.data.actions.find(act => act.itemid == itemid)
    }
    lookup_action(actionid) {
        return this.data.actions.find(act => act.id === actionid)
    }
    lookup_item(itemid) {
        for(let layer of this.data.layers) {
            if(layer.type === 'item') {
                for(let info of layer.data) {
                    console.log("item in layer is",info)
                    if(info.settings.id.value === itemid) {
                        return info
                    }
                }
            }
        }
    }
}
