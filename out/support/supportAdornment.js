"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportAdorner = void 0;
const asp_core_1 = require("../dbg-ground/asp_core");
class SupportAdorner {
    constructor(numeric_program, debug_predicate = '_debug', support_predicate = '_support') {
        this.output_program = "";
        this.numeric_program = numeric_program;
        //since the next steps are based on \n character this transformation has always to be done
        this.numeric_program = this.numeric_program.replace(new RegExp('\r\n', 'gm'), '\n');
        this.output_program = "";
        this.debug_predicate = debug_predicate;
        this.support_predicate = support_predicate;
    }
    // appende ad elements[0](le regole) una regola che ha a:- not support(a). per ogni atomo a nella mappa elements[1]
    // aggiunge support(a) alla mappa di atomi elements[1]
    addSupport() {
        let elements = this.numeric_program.split(/^0\n/gm);
        let support_id = this.retrieveMax(elements[1]);
        let support_maps = "";
        let support_rules = "";
        try {
            elements[1].split("\n").forEach(atom => {
                let groups = atom.match(new RegExp("([0-9]+)\\s+(.+)", "m"));
                if (!groups)
                    return;
                let atom_pred = asp_core_1.Predicate.getFromAtom(groups[2]);
                if (atom_pred != null && atom_pred.getPredicateName().match(`^${this.debug_predicate}\\d+$`) == null) {
                    support_rules = support_rules.concat("1 " + groups[1] + " 1 1 " + support_id + "\n");
                    support_maps = support_maps.concat(support_id + " " + this.support_predicate.concat("(" + groups[2] + ")\n"));
                    support_id += 1;
                }
            });
            elements[0] = elements[0].concat(support_rules);
            elements[1] = elements[1].concat(support_maps);
        }
        catch (e) {
            throw new Error("Unable to parse numeric format ground problem during support adornment: " + e.toString());
        }
        return elements.join("0\n");
    }
    retrieveMax(maps) {
        let max = 1;
        let val;
        maps.split("\n").forEach(atom => {
            atom.split(" ", 1).forEach(id => {
                val = Number(id);
                max = val < max ? max : val + 1;
            });
        });
        return max;
    }
}
exports.SupportAdorner = SupportAdorner;
//# sourceMappingURL=supportAdornment.js.map