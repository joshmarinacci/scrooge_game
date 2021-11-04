import {make_point, Point} from "./util.js";
import {Player} from "./player.js";
import {DialogOverlay} from "./drawing.js";
import {Keyboard} from "./keyboard.js";
import {AssetManager} from "./assets";

type Mode = "map" | "dialog"

export class GameState {
    events: any[]
    test_tile: Point
    private scroll: Point
    private data: any;
    private room: any;
    private player: Player;
    public dialog: DialogOverlay
    public keyboard: Keyboard
    mode:Mode
    private assets: AssetManager;
    private script_state:Map<string,any>

    constructor() {
        this.scroll = make_point(0, 0)
        this.events = []
        this.test_tile = make_point(0, 0)
        this.mode = "map"
        this.script_state = new Map()
    }

    set_mode(mode:Mode) {
        this.mode = mode
    }

    move_scroll(offset: Point) {
        this.scroll = this.scroll.subtract(offset)
    }

    set_scroll(point: Point) {
        this.scroll = point
    }

    dispatch_event(event:any) {
        this.events.push(event)
    }

    set_data(data: any) {
        this.data = data
    }

    set_current_room(room: any) {
        this.room = room
    }

    set_player(player: Player) {
        this.player = player
    }

    get_player() {
        return this.player
    }

    get_current_room() {
        return this.room
    }

    get_scroll() {
        return this.scroll
    }

    lookup_person(person_id:string) {
        return this.data.people.find(p => p.id === person_id)
    }

    lookup_image(image) {
        return this.assets.lookup_image(image)
    }

    set_asset_manager(assets: AssetManager) {
        this.assets = assets
    }

    set_script_state(state) {
        Object.keys(state).forEach(key => {
            this.script_state.set(key,state[key])
        })
    }

    get_script_state(name) {
        return this.script_state.get(name)
    }
}
