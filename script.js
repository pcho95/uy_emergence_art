const csize   = 4000;
const canvas  = document.getElementById('canvas');
canvas.height = csize;
canvas.width  = csize;

const surface = canvas.getContext('2d');
canvas.style.cssText = 'width:600px; height:600px'
console.log( canvas.style.cssText )


const settings = {
  thickness: 10 * (csize/3000),
  color: 'gray',
  color2: 'red'
}


let second_line_layer = 0;
let second_line_freq = 0.75;
let hole_fill = .8
let second_line_min = 0.8;
let second_line_max = 0.8;

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

/* * * * */

/* Make sure background is cleared */
surface.fillStyle = 'white';
surface.fillRect(0, 0, csize, csize);

/* Func: Draw a circle with X segments */
function DrawCircle(x, segments, radius, fuzz, vscale, color) {

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

    surface.lineWidth   = settings.thickness;
    surface.strokeStyle = color;
    surface.beginPath();
    surface.moveTo(point_a[0], point_a[1]);
    surface.lineTo(point_b[0], point_b[1]);
    surface.stroke();

    /* Smooth end */
    surface.fillStyle = color;
    surface.beginPath();
    surface.arc(point_b[0], point_b[1], settings.thickness*.5, 0, 2 * Math.PI);
    surface.fill();
  }
}

let SKIP_SECOND=false;
function Program(count,reverse=false){

  /* get vals from DOM */
  second_line_freq = document.getElementById('second_line_freq').value;
  hole_fill = 1.0 - document.getElementById('hole_fill').value;
  /* * */


  let mid_raw = 0.15;
  let deadzones
  if(!reverse) {
    for(var index=0; index<count; index++) {

      let scale = index/count;

      if (scale < 0.78 && random() < (0.9 + (hole_fill*0.1))) {
        continue;
      }

      let ramp = power(10, 1.1*scale)

      let x = (csize*mid_raw) + power( 1.9, ramp);

      let vscale = 1;
      let lim = 0.9;
      if (scale > lim) {
        vscale = 1 + ( (scale-lim)*10 )
      }

      //let radius = 90 + power(scale,1.9+ramp)*0.1 + (random()*6)
      //if (ramp < 18)
      let segments = scale < 0.78
        ? 20
        : 40 + Math.floor(40*scale);

      let fuzz = scale < 0.78
        ? 5
        : clamp(5 + (scale*4), 0, index*0.1)

      let pickiness = Math.max(.05, 0.8 - scale);
      if(random()*random() > pickiness)
      DrawCircle(
        x,
        segments,
        5 + power(1.915,ramp*1.01) ,
        fuzz,
        vscale,
        settings.color
      );
    }
  }

  let second_line_min = document.getElementById('second_line_min').value;
  let second_line_max = document.getElementById('second_line_max').value;
  let sparse_count = Math.floor(count * (0.02 + (.08 * second_line_freq) ) );
  if (!SKIP_SECOND) {
    for(var index=0; index<sparse_count; index++) {

      let scale = index / sparse_count;

      if (scale < second_line_min || scale > second_line_max) {
        continue;
      }

      let ramp = power(10, 1.1*scale)

      let x = (csize*mid_raw) + power( 1.9, ramp);

      let vscale = 1;
      let lim = 0.9;
      if (scale > lim) {
        vscale = 1 + ( (scale-lim)*10 )
      }

      //let radius = 90 + power(scale,1.9+ramp)*0.1 + (random()*6)
      //if (ramp < 18)
      let pickiness = Math.max(.05, 0.8 - scale);
      if(random()*random() > pickiness)
      DrawCircle(x, 40 + Math.floor(40*scale), 5 + power(1.915,ramp*1.01) , 2 + (scale*4), vscale, settings.color2 );
    }
  }
  SKIP_SECOND=false;
  if(reverse){
    SKIP_SECOND=true;
    Program(count, false);
  }
}

Program(1300);

let run_button = document.getElementById('run');
run_button.onclick = ()=>{
  surface.fillStyle = 'white';
  surface.fillRect(0, 0, csize, csize);
  Program(1300, second_line_layer);
}

//DrawCircle(500, 180, 800, 25);
