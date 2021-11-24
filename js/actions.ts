import {Point} from "./util.js"
import {GameState} from "./game.js";
import {AssetManager} from "./assets.js";
import {Surface} from "./drawing.js";
import {Room} from "./room.js";
export class ActionManager {
    private state: GameState;
    private room_layer: any[];
    private assets: AssetManager;
    private surface: Surface;
    constructor(state:GameState, room_layer:any[], assets:AssetManager, surface:Surface) {
        this.state = state
        this.room_layer = room_layer
        this.assets = assets
        this.surface = surface
    }
    log(...args) {
        console.log(...args)
    }

    perform_action(action, room:Room, info) {
        this.log("performing action", action, info)
        if (action.type === 'dialog') {
            this.perform_dialog(action,room)
        }
        if (action.type === 'script') {
            this.log('doing script action')
            this.perform_script(action,room)
        }
        if (action.type === 'gotoroom') {
            if(info.settings.lockable && info.settings.lockable.value === true) {
                if(info.settings.locked && info.settings.locked.value === true) {
                    this.log("can't go to the room because the door is locked")
                    return
                }
            }
            this.log("going to a new room", action.gotoroom, action.gotoroom.map)
            this.state.keyboard.stop()
            let n = this.room_layer.indexOf(this.state.get_current_room())
            this.room_layer.splice(n, 1)
            this.assets.load_room(action.gotoroom.map).then((room) => {
                this.log("room loaded", room)
                this.state.set_current_room(room)
                this.room_layer.push(this.state.get_current_room())
                //calculate the start point
                let reference_item = room.lookup_item(action.gotoroom.item)
                this.log("looked up the item",action.gotoroom.item,'as',reference_item)
                if(!reference_item) throw new Error(`could not find item for ${action.gotoroom.item}`)
                let start = new Point(reference_item).add(new Point(action.gotoroom.dx, action.gotoroom.dy))
                this.state.get_player().set_center(start)
                this.recenter_room_around_player()
                //run startup scripts
                room.lookup_startup_actions().forEach(cat => {
                    this.perform_action(cat,room,info)
                })

                this.state.keyboard.start()
            })
        }
    }
    check_events() {
        this.state.events.slice().forEach(evt => {
            this.log("event happened", evt)
            if (evt.type === 'use-item') {
                let actions = evt.room.lookup_action_for_item(evt.info.settings.id.value)
                if(actions.length === 1) this.perform_action(actions[0],evt.room,evt.info)
                //if one of the actions is a script, do it first
                if(actions.length > 1) {
                    let scripts = actions.filter(act => act.type === 'script')
                    if(scripts.length >= 1) this.perform_action(scripts[0],evt.room,evt.info)
                }
            }
            if (evt.type === 'next-action') {
                let action = evt.room.lookup_action(evt.actionid)
                this.perform_action(action, evt.room,evt.info)
            }
            if (evt.type === 'jump-dialog') {
                let action = evt.room.lookup_action(evt.dialog)
                this.perform_action(action,evt.room,evt.info)
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



    perform_dialog(action,room) {
        // this.log("doing the dialog", action.dialog)
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
        let STATE = this.state
        const ctx = {
            setState(state) {
                log("setting state",state)
                return STATE.set_script_state(state)
                // return engine.setState(state)
            },
            getState(name) {
                log("getting state for",name)
                return STATE.get_script_state(name)
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
                        if(!item.settings.hasOwnProperty('visible')) {
                            item.settings.visible = { name:'visible', value:true}
                        }
                        item.settings.visible.value = false
                    },
                    show() {
                        log("showing item",item)
                        if(!item.settings.hasOwnProperty('visible')) {
                            item.settings.visible = { name:'visible', value:true}
                        }
                        item.settings.visible.value = true
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
                log('go perform dialog',name)
                setTimeout(() => {
                    STATE.dispatch_event({ type: 'jump-dialog', dialog:name,  room: room })
                }, 0)
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
            set_player_image(image_id) {
                log("seting the player image to",image_id)
                STATE.get_player().set_image_name(image_id)
            },
            log(...args){
                log(...args)
            }
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

