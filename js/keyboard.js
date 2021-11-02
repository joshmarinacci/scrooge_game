export class Keyboard {
    constructor() {
        this.keyboard = {}
        this.enabled = true
    }
    setup_input() {
        document.addEventListener('keydown', (e) => {
            if(!this.enabled) return
            this.keyboard[e.key] = true
        })
        document.addEventListener('keyup', (e) => {
            if(!this.enabled) return
            this.keyboard[e.key] = false
        })
    }
    is_pressed(name) {
        if(!this.enabled) return false
        if(this.keyboard.hasOwnProperty(name) && this.keyboard[name] == true) {
            return true;
        } else {
            return false;
        }
    }
    stop() {
        this.enabled = false
    } 
}
