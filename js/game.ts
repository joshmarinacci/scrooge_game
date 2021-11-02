import {make_point, Point} from "./util.js";

export class GameState {
    private scroll: Point
    events: any[]
    test_tile: Point

    constructor() {
        this.scroll = make_point(0,0)
        this.events = []
        this.test_tile = make_point(0,0)
    }

    move_scroll(offset: Point) {
        this.scroll = this.scroll.subtract(offset)
    }

    dispatch_event(event: { type: string; room: any; info: any }) {
        this.events.push(event)
    }
}
