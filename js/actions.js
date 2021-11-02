import {Point} from "./util.js"
export class ActionManager {
    constructor(state, room_layer, assets, surface) {
        this.state = state
        this.room_layer = room_layer
        this.assets = assets
        this.surface = surface
    }
    log(...args) {
        console.log(...args)
    }

    perform_action(action, room) {
        this.log("performing action", action)
        if (action.type === 'dialog') {
            this.perform_dialog(action,room)
        }
        if (action.type === 'script') {
            this.log('doing script action')
            let ctx = {
                item: function (id) {
                    // this.log("looking up item", id)
                    let item = room.lookup_item(id)
                    // this.log("the item is", item)
                    let item_wrapper = {
                        hide() {
                            // log("hiding", item)
                            item.settings.visible.value = false
                        }
                    }
                    return item_wrapper
                }
            }
            ctx.item('voice').hide()
            this.state.keyboard.start()
        }
        if (action.type === 'gotoroom') {
            this.log("going to a new room", action.gotoroom)
            this.state.keyboard.stop()
            let n = this.room_layer.indexOf(this.state.ROOM)
            this.room_layer.splice(n, 1)
            this.log("now room layers are", this.room_layer.length)
            this.assets.load_room('pearlygates').then((room) => {
                this.log("room loaded", room)
                this.state.ROOM = room
                this.room_layer.push(this.state.ROOM)
                let start = new Point(room.data.start).add(new Point(action.gotoroom.dx, action.gotoroom.dy))
                this.log('starting at', start)
                this.state.PLAYER.center = new Point(action.gotoroom.dx, action.gotoroom.dy)
                this.recenter_room_around_player()
                this.state.keyboard.start()
            })
        }
    }
    check_events() {
        this.state.events.slice().forEach(evt => {
            this.log("event happened", evt)
            if (evt.type === 'use-item') {
                let action = evt.room.lookup_action_for_item(evt.info.settings.id.value)
                this.log("action",action)
                if(action) this.perform_action(action, evt.room)
            }
            if (evt.type === 'next-action') {
                let action = evt.room.lookup_action(evt.actionid)
                this.perform_action(action, evt.room)
            }
        })
        this.state.events = []
    }

    recenter_room_around_player() {
        let player = this.state.get_player()
        console.log("player is at",player.center)
        console.log("screne is", this.surface.viewport.width_in_tiles)
        let pt = new Point(
            (player.center.x - this.surface.viewport.width_in_tiles/2) * (-16),
            (player.center.y - this.surface.viewport.height_in_tiles/2) * (-16)
        )
        this.state.set_scroll(pt)
    }

    player_enter_room(player, room) {
        this.log("player goes to room", player, room.data.start)
        player.x = room.data.start.x
        player.y = room.data.start.y
        this.recenter_room_around_player()
    }


    perform_dialog(action,room) {
        this.log("doing the dialog", action.dialog)
        this.state.set_mode("dialog")
        this.state.dialog.set_action(action)
        this.state.dialog.visible = true
        this.state.dialog.on('end',() => {
            console.log("we are done. action next is", action.next)
            this.state.dialog.visible = false
            this.state.set_mode('map')
            if (action.next) {
                setTimeout(() => {
                    this.state.dispatch_event({ type: 'next-action', actionid: action.next, room: room })
                }, 0)
            }
        })
    }
}

