export class Keyboard {
    private keyboard: {};
    private enabled: boolean;
    constructor() {
        this.keyboard = {}
        this.enabled = true
    }
    setup_input() {
        document.addEventListener('keydown', (e) => {
            if(!this.enabled) return
            this.keyboard[e.code] = true
            // console.log("key down is",e)
        })
        document.addEventListener('keyup', (e) => {
            if(!this.enabled) return
            this.keyboard[e.code] = false
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
        Object.keys(this.keyboard).forEach(key => {
            this.keyboard[key] = false
        })
    }
    start() {
        this.enabled = true
    }
}
