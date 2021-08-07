/// <reference path='phys/physold.ts'/>
/// <reference path='chem.ts'/>
/// <reference path='color/colormodels.ts'/>
// <reference path='../raw/tut.matter.js'/>

// @ts-ignore
// let universe = universe ? universe : 0 as any;


function phys<S extends Substance | SubstGroup>(s: S, pos?: [num,num], size?:[num,num],): S {
    if(!s.physhook) {
        let vec;
        if(pos) {
            vec = {'x':pos[0], 'y':pos[1]};
        } else {
            vec = {'x': 100, 'y': 100};
        }
        let vsize;
        if(size) {
            vsize = { 'x': size[0], 'y': size[1] };
        } else {
            vsize = { 'x': 100, 'y': 100 };
        }
        if (s instanceof Substance) {
            // s.physhook = new PhysicsHook(pos, size);
            s.physhook = newPhysicsHook(vec, vsize, s); //new PhysicsHookNew(vec, vsize);
            Matter.Composite.add(universe.world, [s.physhook]); //.rect]);

        } else if (s === SubstGroup.BOUNDS_ONLY) {
            assert(false, "Use newBounds()!");
        } else if(s instanceof SubstGroup) {
            // s.physhook = new PhysicsHook(pos, size);

            s.physhook = newPhysicsHook(vec, vsize, s); // new PhysicsHookNew(vec, vsize);

            for (let subs of s.substances) {
                phys(subs);
            }


        } else throw "Somehow passed arg was neither substance nor system? "+ s;
        
    }
    return s;
}

class Drawer {
    draw(ctx: CanvasRenderingContext2D, s: Substance | SubstGroup) {
        if (s instanceof Substance) {
            // if (s instanceof AqueousSubstance) {
                // ctx.beginPath();
                // ctx.stroke();
                // ctx.fillStyle = "#" + s.color().join("");
                let prevs = ctx.fillStyle;

                ctx.fillStyle = s.hexcolor();
                if(!s.physhook) s = phys(s);
                if(!s.physhook) throw "broke";
                this.drawB(ctx, s.physhook); //.rect);
                // ctx.fillRect(s.physhook.pos.x, s.physhook.pos.y, s.physhook.size.x, s.physhook.size.y);
                ctx.fillStyle = prevs;

                return;
            // }
        } else if (s instanceof SubstGroup) {
            s = s as SubstGroup;

            for (let sub of s.substances) {
                this.draw(ctx, sub);
            }

            for (let subsys of s.subsystems) {
                this.draw(ctx, subsys);
            }
            // ctx.beginPath();
            // ctx.stroke();
            // let prevs = ctx.fillStyle;
            // ctx.fillStyle = "#FFFFFFFF";
            // if (!s.physhook) s = phys(s);
            // ctx.fillRect(s.physhook.loc[0], s.physhook.loc[1], s.physhook.xsize, s.physhook.ysize);
            // if (!s.physhook) throw "broke";
            // this.drawB(ctx, s.physhook.rect);
            // ctx.fillStyle = prevs;
            // the order kinda matters but I'll leave that up to custom drawers
            // actually let's not draw Systems
            // Also Systems correspond to Composites extremely closely - reduce objects
            return;
        } else throw "Somehow passed arg was neither substance nor system? " + s;

    }
    
    drawC(ctx: CanvasRenderingContext2D, cs: Matter.Composite) {
        // ctx.stroke();
        ctx.strokeStyle = '#888888';
        for(let b of Matter.Composite.allBodies(cs)) {
            if('substs' in b) continue; // skip it to avoid duplicates
            this.drawB(ctx, b);
        }
    }
    drawB(ctx: CanvasRenderingContext2D, b: Matter.Body) {

        let vs = b.vertices;
        ctx.beginPath();
        ctx.moveTo(vs[0].x, vs[0].y);
        for (let i = 1; i < vs.length; i++) {
            let v = vs[i];
            ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let ctx = canvas.getContext('2d');

class Global extends SubstGroup {
    solids_i=0;
    gases_i=0;
    liquids_i=0;
    addSubst(s: Substance) {
        if(s.state === 'g') {
            this.substances.splice(this.gases_i, 0, s); // insert at index of gases_idx
            this.gases_i++;
            this.liquids_i++;
            this.solids_i++;
        } else if(s.state === 'l') {
            this.substances.splice(this.liquids_i, 0, s); // insert at index
            this.liquids_i++;
            this.solids_i++;
        } else if (s.state === 'l') {
            this.substances.splice(this.solids_i, 0, s); // insert at index
            this.solids_i++;
        } else {
            this.substances.push(s);
        }
    }
}
const glob = new Global();
phys(glob, [0, 0], [canvas.width, canvas.height]);
let b = newBounds({x:0, y:0}, {x:canvas.width/2, y:canvas.height/2});

function tang<S extends Substance | SubstGroup>(s: S, addToGlobal=true, pos?: [num, num, num], size?: [num, num, num],): S {
    let ret = phys(s);


    if(addToGlobal) {
        if (ret instanceof Substance) {
            // glob.substances.push(ret);
            glob.addSubst(ret);
        } else if (ret instanceof SubstGroup) {
            glob.subsystems.push(ret);
        } else throw "s " + ret + "not instanceof System nor Substance!";
    }
    return ret;
}

var drawer = new Drawer(); // the principal drawer

function redraw(t?: num) {
    let canvas = document.getElementById("canvas");

    if(canvas && canvas instanceof HTMLCanvasElement) {

        let ctxt = canvas.getContext("2d");
        if(ctxt === null) throw "Context is null?";
        ctxt.clearRect(0, 0, canvas.width, canvas.height);

        ctxt.fillStyle = '#000000';
        drawer.drawC(ctxt, universe.world);
        drawer.draw(ctxt, glob);
    } else {
        throw "Canvas doesn't exist?";
    }
}
function updateZIndex() {
    // basically, move gases towards the front of the so they're drawn behind solids
    // TODO: reorder universe.world according to glob
}

(function() {
    let func = () => {
        redraw();
        requestAnimationFrame(func);
    }
    window.requestAnimationFrame(func);
})();






