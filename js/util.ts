export class Point {
    x:number
    y:number
    constructor(x:any,y?:any) {
        if(typeof x == 'number') {
            this.x = x
            this.y = y
        } else {
            this.x = x.x
            this.y = x.y
        }
    }
    add(pt) {
        return new Point(this.x + pt.x, this.y + pt.y)
    }

    subtract(pt: Point) {
        return new Point(this.x - pt.x, this.y - pt.y)
    }

    multiplyScalar(scalar: number) {
        return new Point(this.x*scalar, this.y*scalar)
    }
}

export function make_point(x,y) {
    return new Point(x,y)
}

export class Rect {
    pos: Point;
    size: Point;
    constructor(a1:any,a2:any,a3?:any,a4?:any) {
        this.pos = new Point(0,0)
        this.size = new Point(0,0)
        if(typeof a1 === 'number') this.pos.x = a1
        if(typeof a2 === 'number') this.pos.y = a2
        if(typeof a3 === 'number') this.size.x = a3
        if(typeof a4 === 'number') this.size.y = a4
        if(a1 instanceof Point) this.pos = a1
        if(a2 instanceof Point)  this.size = a2
    }

    multiplyScalar(scalar: number) {
        return new Rect(
            this.pos.multiplyScalar(scalar),
            this.size.multiplyScalar(scalar)
        )
    }

    add(pt:Point) {
        return new Rect(this.pos.add(pt),this.size)
    }

    inset(number: number) {
        let off = new Point(number,number)
        return new Rect(
            this.pos.add(off),
            this.size.subtract(off).subtract(off)
        )
    }
    left() {
        return this.pos.x
    }
    right() {
        return this.pos.x + this.size.x
    }
    top() {
        return this.pos.y
    }

    bottom() {
        return this.pos.y + this.size.y
    }

    width() {
        return this.size.x
    }
}


type Settings = {
    debug:boolean
    map:string,
    _type:string,
    px:number | null
    py:number | null
}
function parseBoolean(debug) {
    if(typeof debug === 'string') {
        if(debug.toLowerCase() === 'true') return true
        if(debug.toLowerCase() === 'false') return false
    }
    return false
}

export function parse_url(search, data) {
    if(search.startsWith('?')) search = search.substring(1)
    let settings:Settings = {
        _type:"SETTINGS",
        px: undefined,
        py: undefined,
        debug: false,
        map:data.settings.startMapId
    }
    search.split("&")
        .filter(s => s && s.indexOf('=')>0)
        .map(kp => {
            let [key,value] = kp.split("=")
            if(key === 'debug') return settings.debug = parseBoolean(value)
            if(key === 'px') return settings.px = parseInt(value)
            if(key === 'py') return settings.py = parseInt(value)
            if(key === 'map') return settings.map = value
            settings[key]= value
        })

    if((!settings.map) || (!data.maps[settings.map])) {
        console.error(`map not found: "${settings.map}"`)
        settings.map = data.settings.startMapId
    }
    console.log("final settings are",settings)
    return settings
}
