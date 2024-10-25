// Shorthand selector functions for single and multiple element selection
const $ = str => document.querySelector(str); // Selects a single element by query
const $$ = str => document.querySelectorAll(str); // Selects all elements matching a query

// Immediately-invoked function to initialize the carousel functionality
(function() {
    // Ensure the global 'app' object is defined
    if (!window.app) {
        window.app = {};
    }

    // Define carousel functionality within the app object
    app.carousel = {

        // Function to remove a specific class from an element or clear all classes
        removeClass: function(el, classname = '') {
            if (el) {
                if (classname === '') { 
                    el.className = ''; // Clears all classes if none specified
                } else {
                    el.classList.remove(classname); // Removes a specified class
                }
                return el;
            }
            return;
        },

        // Function to reorder carousel items by setting their dataset position
        reorder: function() {
            let childcnt = $("#carousel").children.length;
            let childs = $("#carousel").children;

            for (let j = 0; j < childcnt; j++) {
                childs[j].dataset.pos = j; // Set data-pos for ordering
            }
        },

        // Main function to handle moving the carousel in a given direction
        move: function(el) {
            let selected = el;

            // Determine if el is a string direction ("next"/"prev") or element
            if (typeof el === "string") {
                selected = (el == "next") ? $(".selected").nextElementSibling : $(".selected").previousElementSibling;
            }

            let curpos = parseInt(app.selected.dataset.pos); // Current selected position
            let tgtpos = parseInt(selected.dataset.pos); // Target position
            let cnt = curpos - tgtpos; // Calculate shift count
            let dir = (cnt < 0) ? -1 : 1; // Determine direction
            let shift = Math.abs(cnt); // Absolute value for shift

            // Loop to move items based on the direction and shift
            for (let i = 0; i < shift; i++) {
                let el = (dir == -1) ? $("#carousel").firstElementChild : $("#carousel").lastElementChild;

                if (dir == -1) {
                    el.dataset.pos = $("#carousel").children.length;
                    $('#carousel').append(el); // Move first child to the end
                } else {
                    el.dataset.pos = 0;
                    $('#carousel').prepend(el); // Move last child to the start
                }

                app.carousel.reorder(); // Reorder elements after shift
            }

            // Update selected element and its neighboring positions
            app.selected = selected;
            let next = selected.nextElementSibling;
            let prev = selected.previousElementSibling;
            let prevSecond = prev ? prev.previousElementSibling : selected.parentElement.lastElementChild;
            let nextSecond = next ? next.nextElementSibling : selected.parentElement.firstElementChild;

            // Assign classes to position the selected and neighboring elements
            selected.className = '';
            selected.classList.add("selected");

            app.carousel.removeClass(prev).classList.add('prev');
            app.carousel.removeClass(next).classList.add('next');
            app.carousel.removeClass(nextSecond).classList.add("nextRightSecond");
            app.carousel.removeClass(prevSecond).classList.add("prevLeftSecond");

            // Hide elements not adjacent to selected
            app.carousel.nextAll(nextSecond).forEach(item => { item.className = ''; item.classList.add('hideRight') });
            app.carousel.prevAll(prevSecond).forEach(item => { item.className = ''; item.classList.add('hideLeft') });
        },

        // Function to get all elements after a specified element
        nextAll: function(el) {
            let els = [];
            if (el) {
                while (el = el.nextElementSibling) { els.push(el); }
            }
            return els;
        },

        // Function to get all elements before a specified element
        prevAll: function(el) {
            let els = [];
            if (el) {
                while (el = el.previousElementSibling) { els.push(el); }
            }
            return els;
        },

        // Function to handle keyboard navigation for carousel
        keypress: function(e) {
            switch (e.which) {
                case 37: // left arrow key
                    app.carousel.move('prev');
                    break;

                case 39: // right arrow key
                    app.carousel.move('next');
                    break;

                default:
                    return;
            }
            e.preventDefault();
            return false;
        },

        // Select a specific carousel item on click
        select: function(e) {
            let tgt = e.target;
            // Traverse up to find the correct target
            while (!tgt.parentElement.classList.contains('carousel')) {
                tgt = tgt.parentElement;
            }
            app.carousel.move(tgt); // Move to the selected element
        },

        // Move carousel to previous item
        previous: function(e) {
            app.carousel.move('prev');
        },

        // Move carousel to next item
        next: function(e) {
            app.carousel.move('next');
        },

        // Detect initial mouse or touch position for swipe
        doDown: function(e) {
            app.carousel.state.downX = e.x;
        },

        // Detect end of swipe and determine direction
        doUp: function(e) {
            let direction = 0,
                velocity = 0;

            if (app.carousel.state.downX) {
                direction = (app.carousel.state.downX > e.x) ? -1 : 1;
                velocity = app.carousel.state.downX - e.x;

                // Handle small movements as a click to select
                if (Math.abs(app.carousel.state.downX - e.x) < 10) {
                    app.carousel.select(e);
                    return false;
                }
                // Move carousel based on swipe direction
                if (direction === -1) {
                    app.carousel.move('next');
                } else {
                    app.carousel.move('prev');
                }
                app.carousel.state.downX = 0;
            }
        },

        // Initialize carousel with event listeners
        init: function() {
            document.addEventListener("keydown", app.carousel.keypress); // Key navigation
            $("#carousel").addEventListener("mousedown", app.carousel.doDown); // Swipe detection
            $("#carousel").addEventListener("touchstart", app.carousel.doDown);
            $("#carousel").addEventListener("mouseup", app.carousel.doUp);
            $("#carousel").addEventListener("touchend", app.carousel.doup);

            app.carousel.reorder(); // Initial reordering
            $('#prev').addEventListener("click", app.carousel.previous); // Button navigation
            $('#next').addEventListener("click", app.carousel.next);
            app.selected = $(".selected"); // Initialize selected element
        },
        
        state: {} // Object to store carousel state variables

    }

    // Start carousel initialization on page load
    app.carousel.init();
})();
