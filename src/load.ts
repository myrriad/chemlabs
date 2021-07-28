function defButton() {
    let sub = KMnO4.form();
    tang(sub);

    let sub2 = w('KMnO4');
    // sub2.physhook!.pos = {x:10, y:0};
    redraw();
}

function slider() {
    let h = document.querySelector("#slider") as any;
    for(let s of glob.s) {
        if(s instanceof AqueousSubstance) {
            // s.concentration = h.value / 10000000;
            // s.concentration = h.value / 10;
            // apparently the maximum molarity of KMnO4 is a mere 0.405 M lol
            s.concentration = h.value / 2500;
            redraw();
        }
    }

    let canvas = document.getElementById("canvas");
    let hud = document.getElementById("hud");

    if (hud && hud instanceof HTMLCanvasElement) {
        let ctx = hud.getContext("2d");
        if (ctx === null) throw "Context is null?";
        // gvar.ctxt = ctxt;
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 1000)));
        // let m = rgb_from_spectrum(f_daylight);

        let m = rgb_from_spectrum(x => transmittance(spectra_kmno4_f(x), h.value / 2500)); // / 10));

        // ctxt.beginPath();
        makeRect(0, 10, 10, 10, m, ctx);

        let n = rgb_from_spectrum_concen(spectra_kmno4_f, h.value / 2500); // / 10);
        makeRect(0, 20, 10, 10, n, ctx);
//  / 46 / (149 * 10 ^ -6)
        let p = rgb_from_spectrum(x => f_daylight(x) * transmittance(spectra_kmno4_f(x), h.value / 2500)); // 10));
        makeRect(0, 30, 10, 10, p, ctx);
        
        // let kmno4_base_xyz = [148.40102601907597, 113.28932147129379, 170.4166480460002];
        // let q = rgb_from_base_xyz(kmno4_base_xyz, h.value / 10);
        // ctxt.fillStyle = _hex(q[0], q[1], q[2]);
        // ctxt.fillRect(0, 40, 10, 10);
    }

    // rgb_from_xyz(xyz_from_spectrum(x => transmittance(spectra_kmno4_f(x), 1)));
}



function makeRect(x: num, y: num, width: num, height: num, col: num[], ctxt?: CanvasRenderingContext2D) {
    // if(!ctxt) {
        // ctxt = gvar.ctxt;
    // }
    if(!ctxt) {
        let h = document.getElementsByTagName('canvas')[0];
        let c = undefined;
        if(h) c = h.getContext('2d');
        if(c) {
            ctxt = c;
        } else throw "Couldn't find context for canvas";
    }
    ctxt.fillStyle = _hex(col[0], col[1], col[2]);
    ctxt.fillRect(x, y, width, height);
}

function graph(f?: (x: num) => num, start: num = 360, end: num = 830) {
    if(!f) f = f_daylight;
    // if (!f) f = spectra_kmno4_f;

    let canvas = document.getElementById("canvas");
    if (canvas && canvas instanceof HTMLCanvasElement) {
        let ctxt = canvas.getContext("2d");
        if (ctxt === null) throw "Context is null?";
        // let m = irgb_from_xyz(xyz_from_spectrum(x => f_fluor_white(x)));
        for (let i = start; i < end; i++) {
            ctxt.beginPath();
            ctxt.fillStyle = '#FF0000';
            ctxt.fillRect(0.6 * (i - start), 130 * (1 - f(i)) + 10, 0.6, 1);
            ctxt.stroke();
        }
    }
}

function onCommandButton() {
    let h = document.getElementById("cmdbox");
    let h2 = h as HTMLTextAreaElement;
    let txt = h2.value;
    // console.log(typeof h);
    // let [formula, quantity] = grandUnifiedTknr(txt);
    // console.log(formula);
    // console.log(quantity);
    let s = w(txt);
    console.log(s);
    return s;
}

function debugBody(body: Matter.Body) {
    let paste = document.getElementsByClassName('db-vw-paste')[0];
    if('subst' in body) {
        let ph = body as Matter.Body & {'subst': any};
        let ret = '';
        if(!(ph.subst instanceof Substance)) throw "subst field isn't a substance?";
        let s = ph.subst as Substance;
        ret = `${s.type.chemicalFormula} ${s.mass}g ${s.volume}L ${s.temperature}K`;
        paste.textContent = ret;
    } else {
        paste.textContent = "None";
    }
}
// __ = function () {
//     let h = document.getElementById("cmdbox") as HTMLTextAreaElement;
//     function submitOnEnter(event: any) {
//         if (event.which === 13) {
//             // event.target.form.dispatchEvent(new Event("submit", { cancelable: true }));
//             event.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
//             return onCommandButton();
//             // console.log('hi!');
//         }
//     }

//     h.addEventListener("keypress", submitOnEnter);
// }();