/**
 * Based on: dragslideshow.js v1.0.0
 * https://tympanus.net/codrops/2014/06/26/draggable-dual-view-slideshow/
 * http://www.codrops.com
 */

const classie = require('desandro-classie');
const Dragdealer = require('./dragdealer.js');

'use strict';

let docElem = window.document.documentElement,
	transEndEventNames = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'msTransition': 'MSTransitionEnd',
		'transition': 'transitionend'
	},
	transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
	support = {transitions : Modernizr.csstransitions};

/**
 * Gets the viewport width and height
 * Based on http://responsejs.com/labs/dimensions/
 */
function getViewport(axis) {
	let client, inner;
	if (axis === 'x') {
		client = docElem['clientWidth'];
		inner = window['innerWidth'];
	} else if (axis === 'y') {
		client = docElem['clientHeight'];
		inner = window['innerHeight'];
	}
	return client < inner ? inner : client;
}

/**
 * DragSlideshow default options
 *
 * Elements Hierarchy:
 * slideshow -> dragger -> handle -> slide
 */
let defaultOptions = {
	perspective: 1200,
	slideshowRatio: 0.3, // between 0-1, to calculate dragger resize values when toggled
	draggerWidthPct: 100, // width percentage of dragger in slideshow
	draggerHeightPct: 60, // height percentage of dragger in slideshow
	slideWidthPct: 80, // width percentage of slide in dragger, to calculate actual width & margin of each slide in dragger
	slideContentMargin: 20, // total horizontal margin of '.dragger .slide.show', to calculate actual width of slide when shown
	element: {
		dragger: '.dragger',
		handle: '.handle',
		contentSwitch: 'button.content-switch',
		contentSwitchContainer: '.content-switch-container',
	},
	class: {
		showContent: 'show-content',
		show: 'show',
		current: 'current',
		previous: 'previous',
		next: 'next',
		switchMax: 'switch-max',
		switchMin: 'switch-min',
		switchShow: 'switch-show',
		draggerLarge: 'dragger-large',
		draggerSmall: 'dragger-small'
	},
	onToggle: () => false,
	onToggleContent: () => false,
	onToggleContentComplete: () => false
}

/**
 * DragSlideshow class
 */
export default class DragSlideshow {
	constructor(el, options) {
		this.el = el;
		this.options = Object.assign(defaultOptions, options);
		this._init();
	}

	/**
	 * Function to initialize DragSlideshow
	 * initialize vars
	 */
	_init() {
		// Index of current slide
		this.current = 0;

		// Fullscreen Status
		this.isFullscreen = true;

		// The slides wrapper element
		this.dragger = this.el.querySelector(this.options.element.dragger);

		// The moving element inside the slides wrapper
		this.handle = this.dragger.querySelector(this.options.element.handle);

		// The slides
		this.slides = [].slice.call(this.handle.children);

		// Total number of slides
		this.slidesCount = this.slides.length;
		if (this.slidesCount < 1) return;

		// Add "current" class to the first slide
		classie.add(this.slides[this.current], this.options.class.current);

		// Add adjacent class to the second slide
		classie.add(this.slides[this.current + 1], this.options.class.next);

		// Set the width of the handle
		this.handle.style.width = (this.slidesCount * this.options.draggerWidthPct) + '%';

		// Set the width of each slide
		this.originalWidth = (this.options.slideWidthPct / this.slidesCount) + '%';
		this.originalMargin = '0 ' + (((this.options.draggerWidthPct - this.options.slideWidthPct) / 2) / this.slidesCount) + '%';
		this.toggledWidth = this.options.slideshowRatio * this.options.draggerWidthPct + '%';
		this.toggledHeight = this.options.slideshowRatio * this.options.draggerHeightPct + '%'
		this.contentWidth = 'calc(' + (this.options.draggerWidthPct / this.slidesCount) + '% - ' + this.options.slideContentMargin + 'px';

		this.slides.forEach(slide => {
			slide.style.width = this.originalWidth;
			slide.style.margin = this.originalMargin;
		});

		// Initialize the DragDealer plugin
		this._initDragDealer();

		// Initialize the events
		this._initEvents();
	}

	/**
	 * Function to initialize the Dragdealer plugin
	 */
	_initDragDealer() {
		this.dd = new Dragdealer(this.dragger, {
			steps: this.slidesCount,
			speed: 0.3,
			loose: true,
			callback: (x, y) => {
				this._navigate(x, y);
			}
		});
	}

	/**
	 * DragDealer plugin callback function to update current value
	 */
	_navigate(x, y) {
		// Remove "current" class from the old current slide
		classie.remove(this.slides[this.current || 0], this.options.class.current);
		// Remove adjacent classes from adjacent slides
		if (this.current != 0) {
			classie.remove(this.slides[this.current - 1], this.options.class.previous);
		}
		if (this.current != this.slidesCount - 1) {
			classie.remove(this.slides[this.current + 1], this.options.class.next);
		}

		this.current = this.dd.getStep()[0] - 1;

		// Add "current" class to the new current slide
		classie.add(this.slides[this.current], this.options.class.current);
		// Add adjacent classes to adjacent slides
		if (this.current != 0) {
			classie.add(this.slides[this.current - 1], this.options.class.previous);
		}
		if (this.current != this.slidesCount - 1) {
			classie.add(this.slides[this.current + 1], this.options.class.next);
		}
	}

	/**
	 * Function to initialize the events
	 */
	_initEvents() {
		this.slides.forEach(slide => {
			slide.addEventListener('click', () => {
				if (this.isFullscreen || this.dd.activity || this.isAnimating) return false;

				// Toggle only when it's minimized slideshow
				if (this.slides.indexOf(slide) === this.current) {
					this.toggle();
				} else {
					this.dd.setStep(this.slides.indexOf(slide) + 1);
				}
			});

			// Toggle content button
			slide.querySelector(this.options.element.contentSwitch ).addEventListener('click', () => {
				this._toggleContent(slide);
			});
		});

		// Scroll events
		document.addEventListener('mousewheel', event => {
			if (!this.isContent) {
				if (event.deltaY < 0) {
					// Scroll up = previous slide
					this.dd.setStep(this.current);
				} else {
					// Scroll down = next slide
					this.dd.setStep(this.current + 2);
				}
			}
		});

		// Keyboard navigation events
		document.addEventListener('keydown', event => {
			let keyCode = event.keyCode || event.which,
				currentSlide = this.slides[this.current];

			if (this.isContent) {
				switch (keyCode) {
					case 38: // Up arrow key
						// Toggle content only if content is scrolled to topmost
						if (currentSlide.scrollTop === 0) {
							this._toggleContent(currentSlide);
						}
						break;
				}
			} else {
				switch (keyCode) {
					case 40: // Down arrow key
						// Toggle content only if it's fullscreen
						if (this.isFullscreen) {
							this._toggleContent(currentSlide);
						}
						break;
					case 37: // Left arrow key
						this.dd.setStep(this.current);
						break;
					case 39: // Right arrow key
						this.dd.setStep(this.current + 2);
						break;
				}
			}
		});
	}

	/**
	 * Function to toggle between fullscreen and minimized slideshow
	 */
	toggle() {
		let self = this,
			p = this.options.perspective,
			r = this.options.slideshowRatio,
			zAxisVal = this.isFullscreen ? p - (p / r) : p - p * r;

		if (this.isAnimating) return false;
		this.isAnimating = true;

		// Add preserve-3d to the slides (seems to fix a rendering problem in firefox)
		this._preserve3dSlides(true);

		// Callback
		this.options.onToggle();

		// Toggle switch classes
		classie.remove(this.el, this.isFullscreen ? this.options.class.switchMax : this.options.class.switchMin);
		classie.add(this.el, this.isFullscreen ? this.options.class.switchMin : this.options.class.switchMax);

		this.dragger.style.WebkitTransform = 'perspective(' + p + 'px) translate3d(0, 0, ' + zAxisVal + 'px)';
		this.dragger.style.transform = 'perspective(' + p + 'px) translate3d(0, 0, ' + zAxisVal + 'px)';

		let onEndTransitionFn = function(event) {
			if (support.transitions) {
				if (event.propertyName.indexOf('transform') === -1 || event.target !== self.dragger) return;
				this.removeEventListener(transEndEventName, onEndTransitionFn);
			}

			if (!self.isFullscreen) {
				// Remove preserve-3d to the slides (seems to fix a rendering problem in firefox)
				self._preserve3dSlides();
			}

			// Remove switch classes
			classie.remove(self.el, self.isFullscreen ? self.options.class.switchMin : self.options.class.switchMax);

			// Toggle dragger classes
			classie.remove(this, self.isFullscreen ? self.options.class.draggerLarge : self.options.class.draggerSmall);
			classie.add(this, self.isFullscreen ? self.options.class.draggerSmall : self.options.class.draggerLarge);

			// Reset transforms and set width & height
			self.dragger.style.WebkitTransform = 'translate3d(0, 0, 0)';
			self.dragger.style.transform = 'translate3d(0, 0, 0)';
			this.style.width = self.isFullscreen ? self.toggledWidth : null;
			this.style.height = self.isFullscreen ? self.toggledHeight : null;

			// Reinstatiate the dragger with the "reflow" method
			self.dd.reflow();

			self.isFullscreen = !self.isFullscreen;
			self.isAnimating = false;
		};

		if (support.transitions) {
			this.dragger.addEventListener(transEndEventName, onEndTransitionFn);
		} else {
			onEndTransitionFn();
		}
	}

	/**
	 * Function to show/hide slide content
	 */
	_toggleContent(slide) {
		let container = slide.querySelector(this.options.element.contentSwitchContainer);

		if (this.isAnimating) return false;
		this.isAnimating = true;

		// Callback
		this.options.onToggleContent();

		if (this.isContent) {
			// Enable the dragdealer
			this.dd.enable();
			classie.remove(this.el, this.options.class.showContent);
			classie.remove(slide, this.options.class.show);
			slide.style.width = this.originalWidth;
			slide.style.margin = this.originalMargin;
			container.style.position = null;
			container.style.width = null;
		} else {
			// Disable the dragdealer
			this.dd.disable();
			classie.add(this.el, this.options.class.switchShow);
			classie.add(this.el, this.options.class.showContent);
			classie.add(slide, this.options.class.show);
			slide.style.width = this.contentWidth;
			slide.style.margin = null;
			slide.scrollTop = 0;
		}

		let onEndTransitionFn = event => {
			if (support.transitions) {
				if (event.propertyName.indexOf('transform') === -1 || event.target !== this.el) return;
				this.el.removeEventListener(transEndEventName, onEndTransitionFn);
			}

			// Set properties after the transition ended
			if (this.isContent) {
				classie.remove(this.el, this.options.class.switchShow);
			} else {
				container.style.position = 'fixed';
				container.style.width = this.contentWidth;
			}

			this.isContent = !this.isContent;
			this.isAnimating = false;

			// Callback
			this.options.onToggleContentComplete();
		};

		if (support.transitions) {
			this.el.addEventListener(transEndEventName, onEndTransitionFn);
		} else {
			onEndTransitionFn();
		}
	}

	/**
	 * Function to add/remove preserve-3d to the slides
	 * (seems to fix a rendering problem in firefox)
	 */
	_preserve3dSlides(flag) {
		this.slides.forEach(slide => {
			slide.style.transformStyle = flag ? 'preserve-3d' : '';
		});
	}
}
