import {make_point, Point} from "./util.js";
import {Player} from "./player.js";
import {DialogOverlay} from "./drawing.js";
import {Keyboard} from "./keyboard.js";

export class GameState {
    events: any[]
    test_tile: Point
    private scroll: Point
    private data: any;
    private room: any;
    private player: Player;
    public dialog: DialogOverlay
    public keyboard: Keyboard

    constructor() {
        this.scroll = make_point(0, 0)
        this.events = []
        this.test_tile = make_point(0, 0)
    }

    move_scroll(offset: Point) {
        this.scroll = this.scroll.subtract(offset)
    }

    set_scroll(point: Point) {
        this.scroll = point
    }

    dispatch_event(event: { type: string; room: any; info: any }) {
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
}
