import {GameState} from "./game.js";
import {Point, Rect} from "./util.js";

class SceneObject {
    private listeners: Map<string, [any]>;

    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        this._visible = value;
    }
    private _visible: boolean

    constructor() {
        this._visible = true
        this.listeners = new Map()
    }

    on(type:string, cb:any) {
        if(!this.listeners.has(type)) {
            this.listeners.set(type,[] as any)
        }
        this.listeners.get(type).push(cb)
    }

    protected fire(type: string, payload: any) {
        if(!this.listeners.has(type)) {
            this.listeners.set(type,[] as any)
        }
        this.listeners.get(type).forEach(cb => cb(payload))
    }

}

export class Surface {
    private data: any;
    private tilegroups: any;
    private canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    tile_width: number;
    private tile_height: number;
    scale: number;
    private state: GameState;
    private assets: any;
    private tile_groups: any[];
    private viewport: { width_in_tiles: number; height_in_tiles: number };
    constructor(STATE:GameState, assets,data) {
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
    debug_text(position, offset, text) {
        let h = 15
        let dx = (position.x * this.tile_width + offset.x)*this.scale
        let dy = (position.y * this.tile_height + offset.y)*this.scale
        this.ctx.fillStyle = 'white'
        this.ctx.fillRect(dx,dy,50,h)
        this.ctx.fillStyle = 'black'
        this.ctx.font = `${h}px sans-serif`
        this.ctx.fillText(text,dx,dy+15)
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

    stroke_rect(r: Rect, color: string) {
        this.ctx.strokeStyle = color
        this.ctx.strokeRect(
            r.pos.x,
            r.pos.y,
            r.size.x,
            r.size.y,
        )
    }

    fill_rect(r:Rect, color:string) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(
            r.pos.x,
            r.pos.y,
            r.size.x,
            r.size.y,
        )
    }
}


export class DebugOverlay {
    private state: GameState;
    constructor(state:GameState) {
        this.state = state
    }
    draw(surf) {
        let player = this.state.get_player()
        let scroll = this.state.get_scroll()
        surf.ctx.fillStyle = 'cyan'
        surf.ctx.fillRect(0, 0, 100, 30)
        surf.ctx.fillStyle = 'black'
        surf.ctx.font = '10pt sans-serif'
        surf.ctx.fillText(`scroll ${scroll.x} , ${scroll.y}`, 2, 10)
        surf.ctx.fillText(`player center ${player.center.x} , ${player.center.y}`, 2, 20)
        surf.ctx.fillText(`player offset ${player.offset.x} , ${player.offset.y}`, 2, 30)

        // draw location of player
        surf.stroke_pixel_rect(
            player.center.x * surf.tile_width + scroll.x,
            player.center.y * surf.tile_height + scroll.y,
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
            this.state.test_tile.x * surf.tile_width + scroll.x,
            this.state.test_tile.y * surf.tile_height + scroll.y,
            surf.tile_width,
            surf.tile_height,
            'green'
        )

    }
}

export class DialogOverlay extends SceneObject {
    private state: GameState;
    private action: any;
    private count: number;
    private dfa:number
    constructor(state:GameState) {
        super();
        this.state = state
        this.count = 0
        this.dfa = 0
    }
    check_input() {
        if(this.dfa === 0) {
            if (this.state.keyboard.is_pressed('Space')) {
                this.dfa = 1
                return
            }
        }
        if(this.dfa === 1) {
            if(!this.state.keyboard.is_pressed('Space')) {
                this.dfa = 0
                this.count++
                if(this.count >= this.action.dialog.length) {
                    console.log('we are at the end of the dailog')
                    this.fire("end",{})
                }
                return
            }
        }
    }
    draw(surf) {
        if (!this.visible) return
        let w = 400
        let h = 200
        let xoff = (surf.canvas.width - w) / 2
        let yoff = (surf.canvas.height - h) / 2

        // fill bg
        surf.ctx.fillStyle = 'red'
        surf.ctx.fillRect(xoff, yoff, w, h)
        surf.ctx.fillStyle = 'white'
        surf.ctx.fillRect(xoff + 2, yoff + 2, w - 4, h - 4)

        let phrase = this.action.dialog[this.count]

        //draw image


        let r = new Rect(xoff,yoff,64+16,64+16)
        r = r.add(new Point(8,8))
        surf.fill_rect(r,'black')
        surf.fill_rect(r.inset(surf.scale),'white')
        let off = new Point(xoff/surf.scale+4,yoff/surf.scale+4)
        let pos = new Point(0,0)

        surf.ctx.fillStyle = 'black'
        surf.ctx.font = '25px sans-serif'

        let person = this.state.lookup_person(phrase.person)
        if(person) {
            surf.draw_tile(pos, off, person.center, person.image)
            surf.ctx.fillText(person.title, r.left(), r.bottom() + 30)
        }

        let bounds = new Rect(r.right()+10,r.top(),300,100)
        this.draw_wrapped_text(surf,phrase.text,bounds,25,'black')
    }

    set_action(action) {
        this.action = action
        this.count = 0
        console.log("set dialog to",this.action)
    }

    private draw_wrapped_text(surf:Surface, text: string, bounds: Rect, fontsize:number, color: string) {
        let words = text.split(" ")
        let lines = [];
        let currentLine = words[0]
        let maxWidth = bounds.width()
        for(let i=1; i<words.length; i++) {
            let word = words[i]
            let width = surf.ctx.measureText(currentLine + " " + word).width
            if (width < maxWidth) {
                currentLine += " " + word
            } else {
                lines.push(currentLine)
                currentLine = word
            }
        }
        lines.push(currentLine)
        surf.ctx.fillStyle = color
        surf.ctx.font = `${fontsize}px sans-serif`
        lines.forEach((line,i) => {
            surf.ctx.fillText(line, bounds.pos.x, bounds.pos.y + (i*fontsize) +fontsize)
        })
        // surf.ctx.strokeRect(bounds.pos.x,bounds.pos.y,bounds.size.x,bounds.size.y)
    }
}
