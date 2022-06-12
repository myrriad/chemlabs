"use strict";
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../substance.ts" />
$('#einspector').on('matterCreated', function (e, eventInfo) {
    // originates from phys() in phys.ts
    // alert('(notifier1)The value of eventInfo is: ' + eventInfo);
    console.log('observed creation of ' + eventInfo['matter'].toString());
});
// TODO
// since we are given mixin creation functions for each phase, we can reflexively discover the attributes that each subclass of substance creates
// so we can show them in the inspector
function allKeys(obj) {
    // https://stackoverflow.com/questions/8024149/is-it-possible-to-get-the-non-enumerable-inherited-property-names-of-an-object
    // let result = new Set();
    let result = new Set(Object.keys(obj));
    while (obj) {
        let proto = Object.getPrototypeOf(obj);
        // Since our first-layer object (the direct subclass of Object), SubstGroup, doesn't have any getters or setters, 
        // it doesn't modify the prototype of Object so if we detect that we are reaching the end, we can avoid putting a whole bunch of 
        // boilerplate Object prototype stuff.
        // if proto is null undefined etc.
        if (proto === null || proto === undefined) {
            break;
        }
        // Object.getOwnPropertyNames(obj)
        // obj.entries()
        // .filter((p: string, v: any) => typeof v !== 'function')
        // .forEach(p => result.add(p));
        // we add the getters to the object.keys
        let desc = Object.getOwnPropertyDescriptors(obj);
        Object.entries(desc)
            .filter(([key, descriptor]) => typeof descriptor.get === 'function')
            .forEach(([key]) => { result.add(key); }); //  console.log(key + ' ' + typeof desc[key].get) });
        obj = proto;
    }
    return [...result];
}
let cachedAttrs = {};
function allNewAttributes(obj, oldobj, cache = true) {
    if (cache) {
        let name = obj.constructor.name;
        if (name in cachedAttrs) {
            return cachedAttrs[name];
        }
    }
    let newattr = allKeys(obj);
    let oldattr;
    if (oldobj) {
        oldattr = allKeys(oldobj);
    }
    else {
        let constr2 = obj.constructor.prototype.constructor;
        oldattr = allKeys(new constr2());
    }
    let diff = newattr.filter(x => !oldattr.includes(x)); // remove old attributes from the new to get only the new
    if (cache) {
        cachedAttrs[obj.constructor.name] = diff;
    }
    return diff;
}
function traceExtensionsOn(obj) {
    var proto = obj.constructor.prototype;
    var result = [];
    while (proto) {
        let name = proto.constructor.name;
        if (['Substance', 'SubstGroup', 'Object'].includes(name))
            break;
        result.push(proto.constructor);
        proto = Object.getPrototypeOf(proto);
    }
    return result;
}
function showSubstanceAttributes(subs) {
    let exts = traceExtensionsOn(subs);
    exts.push(Substance);
    // let s = '';
    // create a div
    let div = $('<div>');
    div.addClass('substance-attributes');
    for (let ext of exts) {
        let details = $('<details>');
        if (ext.name === 'Substance')
            details.attr('open'); // automatically open Substance
        // add .substance-attributes to details
        details.append($('<summary>').text(ext.name));
        let attrs = [];
        if (ext.name in cachedAttrs) {
            attrs = cachedAttrs[ext.name];
        }
        else {
            attrs = allNewAttributes(new ext()); // automatically caches the attributes
        }
        let txt = '';
        for (let attr of attrs) {
            let result = subs[attr];
            txt += `${attr}: ${result}\n`;
        }
        details.append($('<code>').text(txt));
        div.append(details);
    }
    return div;
}
(function () {
    cachedAttrs['Substance'] = ['mass', 'volume', 'temperature', 'state'];
    let s = new Substance();
    let ms = new MolecularSubstance();
    allNewAttributes(ms, s);
    let as = new (AqueousSubstance(ms))();
    allNewAttributes(as, ms);
    let gs = new GaseousSubstance();
    allNewAttributes(gs, ms);
})();
$('#einspector').on('substanceCreated', function (e, eventInfo) {
    // originates from tang() in physvis.ts, which itself calls phys() but also adds it to glob.s
    let subs = eventInfo['substance'];
    console.log('observed appendage of ' + subs.toString() + ' to the glob');
    let globule = document.createElement('div');
    globule.classList.add('globule');
    globule.textContent = subs.physhook.label;
    $('#einspector')[0].append(globule);
    let $globule = $(globule);
    let $div = showSubstanceAttributes(subs);
    $div.hide();
    $globule.append($div);
    $div.on('click', function (e) {
        // stop propogation
        e.stopPropagation();
    });
    // when clicked, show the substance's properties
    $globule.on('click', function () {
        // expand the div
        $globule.toggleClass('expanded');
        if ($globule.hasClass('expanded')) {
            let $div = $globule.children('.substance-attributes');
            // clear all children
            $div.empty();
            // set children
            $div.append(showSubstanceAttributes(subs).children());
            $div.show();
        }
        else {
            $globule.children('.substance-attributes').hide();
        }
        // show the substance's properties
    });
});
$('#einspector').on('substanceUpdated', function (e, eventInfo) {
    let subs = eventInfo['substance'];
});