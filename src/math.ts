// TODO: generalize this.
// ie. have a function algebra(eqn: string, vari... variables)
// in general if a provided variable is undefined, assume that it is
// to be solved.
// therefore if we have an eqn of 5 variables and 4 are given, there
// are there are 5 - 4 = 1 unknowns and we can solve.
// for n unknowns there are n-1 degrees of freedom.
// for example if we have PV=nRT
// ideally we would just call `algebra('PV=nRT', 1, undefined, 1, Constants.R, 273)
// and we plug in the variables in the order of appearance in the eqn from left to right
// ie. 1st is pressure P, then volume V, then mol n, then ideal gas constant R, then temp T.
// thus this would solve for volume of 1 mol 1 atm 273 K gas.
// meanwhile if we provide all 5 variables,
// then algebra() would simply plug it into the equation
// and check for equality within a certain tolerance.

class Operator {
    char;
    private constructor(char: string) {
        this.char = char;
        Operator.oplist.push(this);
    }
    static oplist: Operator[] = [];
    private static __ = function () {
        let ops = ['+', '-', '*', '/', '^'];
        for (let op of ops) new Operator(op);
    }();

}
class Expression {
    tokenlist: Array<string | Operator> = [];
    pushVar(varname: string) {
        this.tokenlist.push(varname);
    }
    pushOp(operator: string) {
        this.tokenlist.push(operator);
    }
}

function algebraTknr(inp: string, startidx: num) {
    for (let i = startidx; i < inp.length; i++) {

    }
}
function algebra(eqn: string, ...vari: num[]) {

}

abstract class GeneralizedFunction {
    abstract _zeroes(): tup;
    _x0: tup;
    _v0: tup;
    _a0: tup;
    n3deriv?: tup[];
    constructor(pos?: [num, num, num], vel?: [num, num, num], acc?: [num, num, num], n3deriv?: [num, num, num][]) {

        this._x0 = pos ? pos : this._zeroes().map(x => x + 1);
        this._v0 = vel ? vel : this._zeroes();
        this._a0 = acc ? acc : this._zeroes();
        if (n3deriv) {
            this.n3deriv = n3deriv;
        }
    }

    pos(t?: num): tup {
        return this._x0;
    }
    vel(t?: num): tup {
        return this._v0;
    }
    acc(t?: num): tup {
        return this._a0;
    };
    nthderiv(n: number, t: number): tup {
        switch (n) {
            case 0:
                return this.pos(t);
            case 1:
                return this.vel(t);
            case 2:
                return this.acc(t);
            default:
                if (this.n3deriv) return this.n3deriv[n - 3];
                return this._zeroes();
        }
    }

    step(t0: num, dt: num) {
        /**
         * applies euler's method once 
         * dt = stepsize
         */
        let dx = this.vel(t0).map(v => v * dt);
        this._x0 = this.pos(t0).map((x, i) => x + dx[i]); // perform a veloity update


        let dv = this.acc(t0).map(a => a * dt);
        this._v0 = this.vel(t0).map((v, i) => v + dv[i]); // perform a veloity update
        // TODO updates of higher order derivatives
    }
    eulers(t0: num, dt: num, nsteps: num) {
        for (let i = 0; i < nsteps; i++) {
            this.step(t0, dt);
            t0 = t0 + dt;
        }
    }
}