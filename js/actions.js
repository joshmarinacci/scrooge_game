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
            this.perform_script(action,room)
        }
        if (action.type === 'gotoroom') {
            this.log("going to a new room", action.gotoroom, action.gotoroom.map)
            this.state.keyboard.stop()
            let n = this.room_layer.indexOf(this.state.get_current_room())
            this.room_layer.splice(n, 1)
            this.assets.load_room(action.gotoroom.map).then((room) => {
                this.log("room loaded", room)
                this.state.set_current_room(room)
                this.room_layer.push(this.state.get_current_room())
                let reference_item = room.lookup_item(action.gotoroom.item)
                let start = new Point(reference_item).add(new Point(action.gotoroom.dx, action.gotoroom.dy))
                this.state.get_player().set_center(start)
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
        // console.log("player is at",player.center, player.offset)
        // console.log("screne is", this.surface.viewport.width_in_tiles)
        let pt = new Point(
            (player.center.x - this.surface.viewport.width_in_tiles/2) * (-16),
            (player.center.y - this.surface.viewport.height_in_tiles/2) * (-16)
        )
        this.state.set_scroll(pt)
    }

    player_enter_room(player, room, settings) {
        this.log("player goes to room", player, room.data.start,settings)
        player.x = room.data.start.x
        player.y = room.data.start.y
        if(settings && settings.px) {
            let pt = new Point(settings.px,settings.py)
            player.set_center(pt)
        }
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

    perform_script(action, room) {
        this.log("doing script action",action,room)
        let items = {

        }
        function log(...args) {
            console.log("SCRIPT",...args)
        }
        const ctx = {
            setState(state) {
                // return engine.setState(state)
            },
            getState(name) {
                // return engine.getState(name)
            },
            // state: engine.state,
            item(name) {
                log("getting item",name)
                let item = room.lookup_item(name)
                if(!item) console.error(`Warning. Item "${name}" not found!`)
                log("found item",item)
                let item_wrapper = {
                    hide() {
                        log("hiding item",item)
                        item.settings.visible.value = false
                    },
                    unlock() {
                        log("unlocking item",item)
                        item.settings.locked.value = false
                    }
                }
                return item_wrapper
            },
            action(name) {
                // var act = this.map.findActionByID(name)
                // if(!act) console.log(`WARNING. Action "${name}" not found.`)
                // return act;
            },
            dialog(name,opts) {
                // engine.performDialogAction(this.action(name),opts)
            },
            hasItem(name) {
                // return engine.playerHasItem(name)
            },
            receiveItem(name) {
                // engine.receiveItem(name)
            },
            customDialog(lines, speaker) {
                // return engine.performCustomDialog(lines, speaker)
            },
            customBattle(enemy, dramaticDefeat, music) {
                // return engine.startCustomBattle(enemy,dramaticDefeat, music)
            },
            run(action) {
                // engine.runAction(action)
            },
            restoreHP() {
                // engine.restorePlayerHP()
            },
            pushScreen(name) {
                // const scr = engine.nav.lookupScreen(name);
                // engine.nav.pushScreen(scr)
            },
            playMusic(name) {
                // const music = TileManager.getMusic(name);
                // engine.nav.playMusic(music.path)
            },
            animate(opts) {
                // return engine.animate(opts)
            },
            // map: engine.map,
            // engine: engine,
            // nav: engine.nav,
            // BattleCalcs:BattleCalcs,
            // layer(id) {
            //     return this.map.layers.find((layer)=>layer.id===id)
            // },
            // makeTimeline() {
            //     const timeline= new Timeline()
            //     engine.animations.push(timeline)
            //     return timeline
            // }

        }

        // ctx.item('voice').hide()
        this.state.keyboard.start()


        // const engine = this
        // const ctx = makeContext(engine)
        function doit(ctx) {
            console.log("evaluating",action.script)
            eval(action.script.code);
        }
        doit(ctx);
        return true

    }
}

