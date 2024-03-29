// import { Vector } from "matter-js";


let __ = undefined;

let gvar = {} as any;

let lastClickedObject = undefined;
// glob = Global

type num = number;
type tup = Array<number>;
type tup3 = [num, num, num];
type bool = boolean;

type JsonChemical = { state: string };

// type vec = Vector;
function _componentToHex(c: number) {
    var hex = Math.round(Math.min(c, 255)).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function _hex(r: num | num[], g?: num, b?: num, ...extras: num[]): string {
    if(Array.isArray(r)) {
        if(r.length !== 3) throw new Error("RGB array must be 3, but instead it is " + r.length);
        return _hex(r[0], r[1], r[2], ...extras);
    }
    if(g === undefined || b === undefined) throw new TypeError("Must provide r, g, and b");
    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);

}
function _rgb(hex: string): [num,num,num] {
    if(hex.startsWith('#')) hex = hex.substring(1);
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r,g,b];
}
function assert(condition: any, message?: any, hard=true) {
    if (!condition) {
        if(hard) throw new Error(message || "Assertion failed");
        else console.log(message || "Assertion failed :(")
    }
    return condition;
}

class CollisionFilters {
    group = 0;
    category; // 2^0
    mask; // 4294967293
    // all 0b111...1101 except category 2
    constructor(category: num, mask: num, group = 0) {
        if (group) this.group = group;
        if (category) this.category = category;
        if (mask) this.mask = mask;
    }
    static readonly SOLID = new CollisionFilters(1, 0xFFFFFFFF);
    static readonly MOUSE = new CollisionFilters(2, 0xFFFFFFFF);
    static readonly WALL = new CollisionFilters(4, 0xFFFFFFFF);
    static readonly BEAKER = new CollisionFilters(8, 0xFFFFFFFF);
    static readonly GASLIKE = new CollisionFilters(16, 2 + 4 + 8); // only collide with walls, beakers, and the mouse constraint (allow it to be draggable)
    static readonly BEAKER_PHANTOM = new CollisionFilters(32, 2 + 4 + 8); // this is a phantom object that acts as the glass screen of the beaker, but can't be interacted with by a mouse
    static readonly BACKGROUND_GAS = new CollisionFilters(16, 2 + 4); // only collide with walls, beakers, and the mouse constraint (allow it to be draggable)


}
enum ScreenState {
    PAUSED, RUNNING, CREDITS
}
let universe = {beakers: [] as Beaker[]} as { engine: Matter.Engine, world: Matter.World, runner: Matter.Runner, paused: Boolean, screenstate: ScreenState, glob: Global, beakers: Beaker[]};
universe.paused = false;

function getCanvas(): HTMLCanvasElement {
    let canvas = document.getElementById("canvas");

    if (canvas && canvas instanceof HTMLCanvasElement) {
        return canvas;
    } else {
        throw new TypeError("Canvas doesn't exist?");
    }
}
function getCanvasContext(canvas?: HTMLCanvasElement): CanvasRenderingContext2D {
    if(!canvas) {
        canvas = getCanvas();
    }
    let ctxt = canvas.getContext("2d");
    if (ctxt === null) throw new TypeError("Context is null?");
    return ctxt;
}

function eventDispatch(eventName: string, eventInfo: any, extraSubcribers = '') {
    let subscribers = $('.subscribed, .inspector ' + extraSubcribers);
    subscribers.trigger(eventName, eventInfo);
}
// $('#einspector').on('substanceCreated', function (e, eventInfo) {
//     alert('(notifier1)The value of eventInfo is: ' + eventInfo);
// });

class Constants {
    static R = 8.31446261815324; // (J)/(K-mol) = 
    static Ratm = 0.082057366080960; // (L-atm)/(K-mol)
    static SIprefs = ['n', 'µ', 'm', 'c', 'd', '', 'k'];
    static SIprefscoeffs = [1e-9, 1e-6, 1e-3, 1e-2, 1e-1, 1, 1e3];
}