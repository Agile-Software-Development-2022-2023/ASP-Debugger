"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportAdorner = void 0;
class SupportAdorner {
    constructor(numeric_program, support_predicate = "support") {
        this.output_program = "";
        this.numeric_program = numeric_program;
        this.output_program = "";
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
                if (groups) {
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