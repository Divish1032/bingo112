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