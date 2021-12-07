import {Surface} from "./drawing.js";
import {GameState} from "./game.js";
import {Point, Rect} from "./util.js";

class TouchButton extends Rect {
    pressed: boolean;
    constructor(x,y,w,h) {
        super(x,y,w,h);
        this.pressed = false
    }
}

export class TouchInterface {
    private enabled: boolean;
    private surface: Surface;
    private anytouch_down:boolean
    buttons: Map<string,TouchButton>
    constructor(surface:Surface) {
        this.surface = surface
        this.enabled = true
        this.buttons = new Map<string, TouchButton>()
        this.buttons.set('up',new TouchButton(100, 150, 100, 100))
        this.buttons.set('left', new TouchButton(0, 250, 100, 100))
        this.buttons.set('right',  new TouchButton(200, 250, 100, 100))
        this.buttons.set('down',  new TouchButton(100, 350, 100, 100))
    }
    private press(pt:Point) {
        this.buttons.forEach(bt => {
            if(bt.contains(pt)) bt.pressed = true
        })
    }

    setup_input() {
        this.surface.canvas.addEventListener('mousedown', (e) => {
            if(!this.enabled) return
            this.anytouch_down = true
            let rect = this.surface.canvas.getBoundingClientRect()
            let pt = new Point(e.x - rect.x, e.y - rect.y)
            this.press(pt)
        })
        this.surface.canvas.addEventListener('mouseup', (e) => {
            if(!this.enabled) return
            this.release()
        })
        this.surface.canvas.addEventListener('touchstart',(e) => {
            if(e.touches.length < 1) return
            let touch:Touch = e.touches[0]
            let rect = this.surface.canvas.getBoundingClientRect()
            let pt = new Point(touch.clientX - rect.x, touch.clientY - rect.y)
            this.press(pt)
        })
        this.surface.canvas.addEventListener('touchend',(e) => {
            this.release()
        })
    }

    is_any_touchdown() {
        return this.anytouch_down
    }

    is_pressed(name) {
        if(!this.buttons.has(name)) return false
        return this.buttons.get(name).pressed
    }

    private release() {
        this.anytouch_down = false
        this.buttons.forEach(bt => bt.pressed = false)
    }
}

export class TouchOverlay {
    private state: GameState

    constructor(state: GameState) {
        this.state = state
    }

    draw(surf) {
        this.state.touch.buttons.forEach(bt =>  surf.fill_rect(bt, bt.pressed?"rgba(100,200,255,0.8)":"rgba(100,200,255,0.3)"))
    }

}
