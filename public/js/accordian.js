class Accordion {
  constructor({ element, active = null, multi = false }) {
    this.el = element;
    this.activePanel = active;
    this.multi = multi;

    this.init();
  }

  cacheDOM() {
    this.panels = this.el.querySelectorAll(".expansion-panel");
    this.headers = this.el.querySelectorAll(".expansion-panel-header");
    this.bodies = this.el.querySelectorAll(".expansion-panel-body");
  }

  init() {
    this.cacheDOM();
    this.setSize();
    this.initialExpand();
    this.attachEvents();
  }

  // Remove "active" class from all expansion panels.
  collapseAll() {
    for (const h of this.headers) {
      h.closest(".expansion-panel").classList.remove("active");
    }
  }

  // Add "active" class to the parent expansion panel.
  expand(idx) {
    this.panels[idx].classList.add("active");
  }

  // Toggle "active" class to the parent expansion panel.
  toggle(idx) {
    this.panels[idx].classList.toggle("active");
  }

  // Get the height of each panel body and store it in attribute
  // for the CSS transition.
  setSize() {
    this.bodies.forEach((b, idx) => {
      const bound = b
        .querySelector(".expansion-panel-body-content")
        .getBoundingClientRect();
      b.setAttribute("style", `--ht:${bound.height}px`);
    });
  }

  initialExpand() {
    if (this.activePanel > 0 && this.activePanel < this.panels.length) {
      // Add the "active" class to the correct panel
      this.panels[this.activePanel - 1].classList.add("active");
      // Fix the current active panel index "zero based index"
      this.activePanel = this.activePanel - 1;
    }
  }

  attachEvents() {
    this.headers.forEach((h, idx) => {
      h.addEventListener("click", (e) => {
        if (!this.multi) {
          // Check if there is an active panel and close it before opening another one.
          // If there is no active panel, close all the panels.
          if (this.activePanel === idx) {
            this.collapseAll();
            this.activePanel = null;
          } else {
            this.collapseAll();
            this.expand(idx);
            this.activePanel = idx;
          }
        } else {
          this.toggle(idx);
        }
      });
    });

    // Recalculate the panel body height and store it on resizing the window.
    addEventListener("resize", this.setSize.bind(this));
  }
}



// element: The expansion panels parent.
// active: The active panel index.
// multi: Open more than one panel at once.
const myAccordion = new Accordion({
  element: document.querySelector(".accordion"),
  active: 1,
  multi: false
});



function makeTimer() {

	//		var endTime = new Date("29 April 2018 9:56:00 GMT+01:00");	
		var endTime = new Date("16 May 2020 21:00:00 GMT+05:30");			
			endTime = (Date.parse(endTime) / 1000);

			var now = new Date();
			now = (Date.parse(now) / 1000);

			var timeLeft = endTime - now;

			var days = Math.floor(timeLeft / 86400); 
			var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
			var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600 )) / 60);
			var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
  
			if (hours < "10") { hours = "0" + hours; }
			if (minutes < "10") { minutes = "0" + minutes; }
			if (seconds < "10") { seconds = "0" + seconds; }

			$("#days").html(days + "<span>Days</span>");
			$("#hours").html(hours + "<span>Hours</span>");
			$("#minutes").html(minutes + "<span>Minutes</span>");
			$("#seconds").html(seconds + "<span>Seconds</span>");		

	}

  setInterval(function() { makeTimer(); }, 1000);
  


  anime.timeline({loop: true})
  .add({
    targets: '.ml8 .circle-white',
    scale: [0, 3],
    opacity: [1, 0],
    easing: "easeInOutExpo",
    rotateZ: 360,
    duration: 1100
  }).add({
    targets: '.ml8 .circle-container',
    scale: [0, 1],
    duration: 1100,
    easing: "easeInOutExpo",
    offset: '-=1000'
  }).add({
    targets: '.ml8 .circle-dark',
    scale: [0, 1],
    duration: 1100,
    easing: "easeOutExpo",
    offset: '-=600'
  }).add({
    targets: '.ml8 .letters-left',
    scale: [0, 1],
    duration: 1200,
    offset: '-=550'
  }).add({
    targets: '.ml8 .bang',
    scale: [0, 1],
    rotateZ: [45, 15],
    duration: 1200,
    offset: '-=1000'
  }).add({
    targets: '.ml8',
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1400
  });

anime({
  targets: '.ml8 .circle-dark-dashed',
  rotateZ: 360,
  duration: 8000,
  easing: "linear",
  loop: true
});



var textWrapper = document.querySelector('.ml1 .letters');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: true})
  .add({
    targets: '.ml1 .letter',
    scale: [0.3,1],
    opacity: [0,1],
    translateZ: 0,
    easing: "easeOutExpo",
    duration: 600,
    delay: (el, i) => 70 * (i+1)
  }).add({
    targets: '.ml1 .line',
    scaleX: [0,1],
    opacity: [0.5,1],
    easing: "easeOutExpo",
    duration: 700,
    offset: '-=875',
    delay: (el, i, l) => 80 * (l - i)
  }).add({
    targets: '.ml1',
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000
  });
 

  console.clear();

let width = window.innerWidth;
let height = window.innerHeight;
const body = document.body;

const elButton = document.querySelector(".treat-button");
const elWrapper = document.querySelector(".treat-wrapper");

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const treatmojis = ["🍬", "🍫", "🍭", "🍡", "🍩", "🍪", "🍒"];
const treats = [];
const radius = 15;

const Cd = 0.47; // Dimensionless
const rho = 1.22; // kg / m^3
const A = Math.PI * radius * radius / 10000; // m^2
const ag = 9.81; // m / s^2
const frameRate = 1 / 60;

function createTreat() /* create a treat */{
  const vx = getRandomArbitrary(-10, 10); // x velocity
  const vy = getRandomArbitrary(-10, 1); // y velocity

  const el = document.createElement("div");
  el.className = "treat";

  const inner = document.createElement("span");
  inner.className = "inner";
  inner.innerText = treatmojis[getRandomInt(0, treatmojis.length - 1)];
  el.appendChild(inner);

  elWrapper.appendChild(el);

  const rect = el.getBoundingClientRect();

  const lifetime = getRandomArbitrary(2000, 3000);

  el.style.setProperty("--lifetime", lifetime);

  const treat = {
    el,
    absolutePosition: { x: rect.left, y: rect.top },
    position: { x: rect.left, y: rect.top },
    velocity: { x: vx, y: vy },
    mass: 0.1, //kg
    radius: el.offsetWidth, // 1px = 1cm
    restitution: -.7,

    lifetime,
    direction: vx > 0 ? 1 : -1,

    animating: true,

    remove() {
      this.animating = false;
      this.el.parentNode.removeChild(this.el);
    },

    animate() {
      const treat = this;
      let Fx =
      -0.5 *
      Cd *
      A *
      rho *
      treat.velocity.x *
      treat.velocity.x *
      treat.velocity.x /
      Math.abs(treat.velocity.x);
      let Fy =
      -0.5 *
      Cd *
      A *
      rho *
      treat.velocity.y *
      treat.velocity.y *
      treat.velocity.y /
      Math.abs(treat.velocity.y);

      Fx = isNaN(Fx) ? 0 : Fx;
      Fy = isNaN(Fy) ? 0 : Fy;

      // Calculate acceleration ( F = ma )
      var ax = Fx / treat.mass;
      var ay = ag + Fy / treat.mass;
      // Integrate to get velocity
      treat.velocity.x += ax * frameRate;
      treat.velocity.y += ay * frameRate;

      // Integrate to get position
      treat.position.x += treat.velocity.x * frameRate * 100;
      treat.position.y += treat.velocity.y * frameRate * 100;

      treat.checkBounds();
      treat.update();
    },

    checkBounds() {

      if (treat.position.y > height - treat.radius) {
        treat.velocity.y *= treat.restitution;
        treat.position.y = height - treat.radius;
      }
      if (treat.position.x > width - treat.radius) {
        treat.velocity.x *= treat.restitution;
        treat.position.x = width - treat.radius;
        treat.direction = -1;
      }
      if (treat.position.x < treat.radius) {
        treat.velocity.x *= treat.restitution;
        treat.position.x = treat.radius;
        treat.direction = 1;
      }

    },

    update() {
      const relX = this.position.x - this.absolutePosition.x;
      const relY = this.position.y - this.absolutePosition.y;

      this.el.style.setProperty("--x", relX);
      this.el.style.setProperty("--y", relY);
      this.el.style.setProperty("--direction", this.direction);
    } };


  setTimeout(() => {
    treat.remove();
  }, lifetime);

  return treat;
}


function animationLoop() {
  var i = treats.length;
  while (i--) {
    treats[i].animate();

    if (!treats[i].animating) {
      treats.splice(i, 1);
    }
  }

  requestAnimationFrame(animationLoop);
}

animationLoop();

function addTreats() {
  //cancelAnimationFrame(frame);
  if (treats.length > 40) {
    return;
  }
  for (let i = 0; i < 10; i++) {
    treats.push(createTreat());
  }
}

elButton.addEventListener("click", addTreats);
elButton.click();

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
});