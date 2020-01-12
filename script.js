const csize   = 4000;
const canvas  = document.getElementById('canvas');
canvas.height = csize;
canvas.width  = csize;

const surface = canvas.getContext('2d');
canvas.style.cssText = 'width:600px; height:600px'
console.log( canvas.style.cssText )


const settings = {
  color: 'gray',
  color2: 'red'
}


let second_line_layer = 0;
let second_line_freq = 0.75;
let first_hole_fill = .8;
let second_hole_fill = .8;
let second_line_min = 0.8;
let second_line_max = 0.8;
let bg = 0;

let first_line_width = 10 * (csize/3000);
let second_line_width = 10 * (csize/3000);

/* * * * */
/* ease of use */
function dsin(x) {
  return Math.sin( (x * Math.PI) / 180 );
}

function dcos(x) {
  return Math.cos( (x * Math.PI) / 180 );
}

function random(x=0) {
  return Math.random(x)
}

function power(x,y) {
  return Math.pow(x,y);
}

function clamp(val,min,max) {
  return Math.min(max, Math.max(min, val));
}

function floor(x) {
  return Math.floor(x);
}

/* * * * */

/* Make sure background is cleared */
surface.fillStyle = 'white';
surface.fillRect(0, 0, csize, csize);


/* Func: Draw a circle with X segments */
function DrawCircle(x, segments, radius, fuzz, vscale, color, thickness) {

  /* Generate the pure points */
  var points = [];
  for(let index=0; index < segments; index++){

    let theta = (index / segments) * 360.0;
    points.push([
      x             + dsin(theta)*radius,
      (csize * 0.5) + dcos(theta)*radius
    ]);

  }

  /* Randomly offset the points */
  for(let index=0; index < points.length; index++){

    let point = points[ index ];
    let theta = random() * 360
    let dist = random() * (vscale + fuzz);
    if (random()>0.99) {
      dist = dist*2;
    }
    let new_point = [
      point[0] + dsin(theta)*dist,
      point[1] + dcos(theta)*dist,
    ]

    new_point[1] = (csize/2) + vscale*(new_point[1] - (csize/2))
    points[ index ] = new_point;

  }

  /* Render lines between the offset points */
  for(let index=0; index < points.length; index++){
    let point_a = points[ ( (  index) % points.length) ];
    let point_b = points[ ( (index+1) % points.length) ];

    surface.lineWidth   = thickness;
    surface.strokeStyle = color;
    surface.beginPath();
    surface.moveTo(point_a[0], point_a[1]);
    surface.lineTo(point_b[0], point_b[1]);
    surface.stroke();

    /* Smooth end */
    surface.fillStyle = color;
    surface.beginPath();
    surface.arc(point_b[0], point_b[1], thickness*.5, 0, 2 * Math.PI);
    surface.fill();
  }
}


let SKIP_SECOND=false;

function Program(_count,reverse=false){

  let count_main = document.getElementById('first_line_freq').value * _count;

  // Get vals from DOM
  second_line_freq = document.getElementById('second_line_freq').value;
  first_hole_fill = 1.0 - document.getElementById('first_hole_fill').value;
  second_hole_fill = 1.0 - document.getElementById('second_hole_fill').value;
  first_line_width = document.getElementById('first_line_width').value *2 * (3000/csize);
  second_line_width = document.getElementById('second_line_width').value *2* (3000/csize);

  // Render the first pass
  let mid_raw = 0.15;
  let first_line_min = document.getElementById('first_line_min').value;
  let first_line_max = document.getElementById('first_line_max').value;
  if (!reverse) {
    for(var index=0; index<count_main; index++) {

      let scale = index/count_main;

      if (scale < first_line_min || scale > first_line_max) {
        continue;
      }

      if (scale < 0.78 && random() < (0.9 + (first_hole_fill*0.1))) {
        continue;
      }

      let ramp = power(10, 1.1*scale)

      let x = (csize*mid_raw) + power( 1.9, ramp);

      let lim = 0.9;
      let vscale = (scale > lim)
        ? 1 + ( (scale-lim)*10 )
        : 1;

      let segments = scale < 0.78
        ? 20
        : 40 + floor(40*scale);

      let fuzz = scale < 0.78
        ? 5
        : clamp(5 + (scale*4), 0, index*0.1)

      let pickiness = Math.max(.05, 0.8 - scale);
      if(random()*random() > pickiness) {
        DrawCircle(
          x,
          segments,
          5 + power(1.915,ramp*1.01) ,
          fuzz,
          vscale,
          settings.color,
          first_line_width
        );
      }
    }
  }

  // Render the second pass
  let second_line_min = document.getElementById('second_line_min').value;
  let second_line_max = document.getElementById('second_line_max').value;
  let sparse_count = floor(_count * (0.02 + (.08 * second_line_freq) ) );
  if (!SKIP_SECOND) {
    for(var index=0; index<sparse_count; index++) {

      let scale = index / sparse_count;

      if (scale < second_line_min || scale > second_line_max) {
        continue;
      }

      if (scale < 0.78 && random() < (0.9 + (second_hole_fill*0.1))) {
        continue;
      }

      let ramp = power(10, 1.1*scale)

      let x = (csize*mid_raw) + power( 1.9, ramp);

      let lim = 0.9;
      let vscale = (scale > lim)
        ? 1 + ( (scale-lim)*10 )
        : 1;

      let pickiness = Math.max(.05, 0.8 - scale);
      if (random()*random() > pickiness) {
        DrawCircle(x,
          40 + floor(40*scale),
          5 + power(1.915,ramp*1.01),
          2 + (scale*4),
          vscale,
          settings.color2,
          second_line_width
        );
      }
    }
  }

  SKIP_SECOND=false;

  if (reverse) {
    SKIP_SECOND=true;
    Program(_count, false);
  }
}

/* attach render call to run button */
let run_button = document.getElementById('run');
run_button.onclick = ()=>{
  surface.fillStyle = bg ? 'black' : 'white';
  surface.fillRect(0, 0, csize, csize);
  Program(1300, second_line_layer);
}

Program(1300);
