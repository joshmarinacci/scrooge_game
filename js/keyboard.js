export class Keyboard {
    constructor() {
        this.keyboard = {}
    }
    setup_input() {
        document.addEventListener('keydown', (e) => {
            this.keyboard[e.key] = true
        })
        document.addEventListener('keyup', (e) => {
            this.keyboard[e.key] = false
        })
    }
    is_pressed(name) {
        if(this.keyboard.hasOwnProperty(name) && this.keyboard[name] == true) {
            return true;
        } else {
            return false;
        }
    }
}
