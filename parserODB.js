const Job = require('./models/job');
// import {Point, Segment, Arc, Polygon, Utils, vector} from '@flatten-js/core';
const Flatten = require('@flatten-js/core');
const {Point, Segment, Arc, Polygon, Utils, vector} = Flatten;

const inch2pixels = 10160000;
const mils2pixels = 10160;
function InchToPixels(str) {
    return Math.round(Number(str)*inch2pixels,0);
}
function MilsToPixels(str) {
    return Math.round(Number(str)*mils2pixels,0);
}

function parsePolygon(lines, start) {
    let shapes = [];
    let i = start;
    let line = lines[i];
    let terms = line.split(' ');
    let ps = new Point( InchToPixels(terms[1]), InchToPixels(terms[2]) );
    let pe;
    let pc;
    let end_of_face = false;
    while(true) {
        line = lines[i];
        terms = line.split(' ');
        switch (terms[0]) {
            case 'OS':
                pe = new Point( InchToPixels(terms[1]), InchToPixels(terms[2]) );
                shapes.push( new Segment(ps, pe));

                ps = pe.clone();
                break;
            case 'OC':
                pe = new Point( InchToPixels(terms[1]), InchToPixels(terms[2]) );
                pc = new Point( InchToPixels(terms[3]), InchToPixels(terms[4]) );

                let cwStr = terms[5];
                let counterClockwise = cwStr === 'Y' ? Flatten.CW : Flatten.CCW; /* sic ! */

                let startAngle = vector(pc,ps).slope;
                let endAngle = vector(pc, pe).slope;
                if (Utils.EQ(startAngle, endAngle)) {
                    endAngle += 2*Math.PI;
                    counterClockwise = true;
                }
                let r = vector(pc, ps).length;

                shapes.push(new Arc(pc, r, startAngle, endAngle, counterClockwise));

                ps = pe.clone();
                break;
            case 'OE':
                end_of_face = true;
                break;
            default:
                break;
        }
        if (end_of_face) {
            break;
        }

        i++;
    }
    return shapes;
}

function parseLine(str, apertures) {
    let terms = str.split(' ');
    let ps = new Point( InchToPixels(terms[1]), InchToPixels(terms[2]) );
    let pe = new Point( InchToPixels(terms[3]), InchToPixels(terms[4]) );
    let segment = new Segment(ps, pe);
    let ap_key = Number(terms[5]);
    let ap_value = apertures[ap_key];
    segment.aperture = ap_value;     // augmentation
    return segment;
}

function parseArc(str, apertures) {
    let terms = str.split(' ');
    let ps = new Point( InchToPixels(terms[1]), InchToPixels(terms[2]) );
    let pe = new Point( InchToPixels(terms[3]), InchToPixels(terms[4]) );
    let pc = new Point( InchToPixels(terms[5]), InchToPixels(terms[6]) );

    let cwStr = terms[10];
    let counterClockwise = cwStr === 'Y' ? Flatten.CW : Flatten.CCW; /* sic ! */

    let startAngle = vector(pc,ps).slope;
    let endAngle = vector(pc, pe).slope;
    if (Flatten.Utils.EQ(startAngle, endAngle)) {
        endAngle += 2*Math.PI;
        counterClockwise = true;
    }
    let r = vector(pc, ps).length;

    let arc = new Arc(pc, r, startAngle, endAngle, counterClockwise);

    let ap_key = Number(terms[7]);
    let ap_value = apertures[ap_key];
    arc.aperture = ap_value;     // augmentation

    return arc;
}

function parseODB(filename, str) {
    let job = new Job();
    job.filename = filename;

    let arrayOfLines = str.match(/[^\r\n]+/g);
    let polygon;

    let apertures = [];

    for (let i=0; i < arrayOfLines.length; i++) {
        let line = arrayOfLines[i];
        let terms = line.split(' ');

        if (terms[0].substr(0,1) === '$') {
            let ap_key = Number(terms[0].substr(1));
            let ap_value = MilsToPixels(terms[1].substr(1));
            apertures[ap_key] = ap_value;
            continue;
        }

        switch (terms[0]) {
            case 'S':                  // surface started
                polygon = new Polygon();
                let termArr = line.split(' ');
                let polarity = termArr[1];      // consider later
                polygon.polarity = polarity;
                break;
            case 'OB':                  // polygon started
                let start = i;
                let shapes = parsePolygon(arrayOfLines, start);
                polygon.addFace(shapes);
                i = start + shapes.length + 1;
                break;
            case 'SE':     // surface ended
                job.shapes.push(polygon);
                break;
            case 'L':                  // line
                let odbLine = parseLine(line, apertures);
                job.shapes.push(odbLine);
                break;
            case 'A':                  // Arc
                let odbArc = parseArc(line, apertures);
                job.shapes.push(odbArc);
                break;
            default:
                break;
        }
    }
    return job;
}

module.exports = parseODB;