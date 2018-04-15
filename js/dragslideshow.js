/**
 * Based on: dragslideshow.js v1.0.0
 * https://tympanus.net/codrops/2014/06/26/draggable-dual-view-slideshow/
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

;(function(window) {

	'use strict';

	var docElem = window.document.documentElement,
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
		var client, inner;
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
	 * Extend obj function
	 */
	function extend(a, b) {
		for (var key in b) {
			if (b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	}

	/**
	 * DragSlideshow function
	 */
	function DragSlideshow(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this._init();
	}

	/**
	 * DragSlideshow default options
	 *
	 * Elements Hierarchy:
	 * slideshow -> slider -> handle -> slide
	 */
	DragSlideshow.prototype.options = {
		perspective : '1200',
		slideshowRatio : 0.3, // between 0-1, to calculate slider resize values when toggled
		sliderWidthPct : 100, // width percentage of slider in slideshow
		sliderHeightPct : 60, // height percentage of slider in slideshow
		slideWidthPct : 80, // width percentage of slide in slider, to calculate actual width & margin of each slide in slider
		slideAdjPct : 4.5, // "left" percentage of adjacent slides
		slideContentMargin : 20, // total horizontal margin of '.slider .slide.show', to calculate actual width of slide when shown
		element: {
			slider : 'section.dragdealer',
			handle : 'div.handle',
			contentSwitch : 'button.content-switch',
			contentSwitchContainer : '.content-switch-container',
		},
		class : {
			showContent : 'show-content',
			show : 'show',
			current : 'current',
			switchMax : 'switch-max',
			switchMin : 'switch-min',
			switchShow : 'switch-show',
			sliderLarge : 'slider-large',
			sliderSmall : 'slider-small'
		},
		onToggle : function() { return false; },
		onToggleContent : function() { return false; },
		onToggleContentComplete : function() { return false; }
	}

	/**
	 * Function to initialize DragSlideshow
	 * initialize vars
	 */
	DragSlideshow.prototype._init = function() {
		var self = this;

		// Index of current slide
		self.current = 0;

		// Fullscreen Status
		self.isFullscreen = true;

		// The slides wrapper element
		self.slider = self.el.querySelector(self.options.element.slider);

		// The moving element inside the slides wrapper
		self.handle = self.slider.querySelector(self.options.element.handle);

		// The slides
		self.slides = [].slice.call(self.handle.children);

		// Total number of slides
		self.slidesCount = self.slides.length;
		if (self.slidesCount < 1) return;

		// Add "current" class to the first slide
		classie.add(self.slides[self.current], self.options.class.current);

		// Add "left" CSS property to the second slide
		self.slides[self.current + 1].style.left = '-' + self.options.slideAdjPct + '%';

		// Set the width of the handle
		self.handle.style.width = self.slidesCount * self.options.sliderWidthPct + '%';

		// Set the width of each slide
		self.originalWidth = (self.options.slideWidthPct / self.slidesCount) + '%';
		self.originalMargin = '0 ' + (((self.options.sliderWidthPct - self.options.slideWidthPct) / 2) / self.slidesCount) + '%';
		self.toggledWidth = 'calc(' + (self.options.sliderWidthPct / self.slidesCount) + '% - ' + self.options.slideContentMargin + 'px';

		self.slides.forEach(function(slide) {
			slide.style.width = self.originalWidth;
			slide.style.margin = self.originalMargin;
		});

		// Initialize the DragDealer plugin
		self._initDragDealer();

		// Initialize the events
		self._initEvents();
	}

	/**
	 * Function to initialize the Dragdealer plugin
	 */
	DragSlideshow.prototype._initDragDealer = function() {
		var self = this;
		self.dd = new Dragdealer(self.slider, {
			steps : self.slidesCount,
			speed : 0.3,
			loose : true,
			callback : function(x, y) {
				self._navigate(x, y);
			}
		});
	}

	/**
	 * DragDealer plugin callback function to update current value
	 */
	DragSlideshow.prototype._navigate = function(x, y) {
		var self = this;
		// Remove "current" class from the old current slide
		classie.remove(self.slides[self.current || 0], self.options.class.current);
		// Remove "left" CSS property from adjacent slides
		if (self.current != 0) {
			self.slides[self.current - 1].style.left = null;
		}
		if (self.current != self.slidesCount - 1) {
			self.slides[self.current + 1].style.left = null;
		}

		self.current = self.dd.getStep()[0] - 1;

		// Add "current" class to the new current slide
		classie.add(self.slides[self.current], self.options.class.current);
		// Add "left" CSS property to adjacent slides
		if (self.current != 0) {
			self.slides[self.current - 1].style.left = self.options.slideAdjPct + '%';
		}
		if (self.current != self.slidesCount - 1) {
			self.slides[self.current + 1].style.left = '-' + self.options.slideAdjPct + '%';
		}
	}

	/**
	 * Function to initialize the events
	 */
	DragSlideshow.prototype._initEvents = function() {
		var self = this;

		self.slides.forEach(function(slide) {
			slide.addEventListener('click', function() {
				if (self.isFullscreen || self.dd.activity || self.isAnimating) return false;

				// Toggle only when it's minimized slideshow
				if (self.slides.indexOf(slide) === self.current) {
					self.toggle();
				} else {
					self.dd.setStep(self.slides.indexOf(slide) + 1);
				}
			});

			// Toggle content button
			slide.querySelector(self.options.element.contentSwitch ).addEventListener('click', function() {
				self._toggleContent(slide);
			});
		});

		// Scroll events
		document.addEventListener('mousewheel', function(event) {
			if (!self.isContent) {
				if (event.deltaY < 0) {
					// Scroll up = previous slide
					self.dd.setStep(self.current);
				} else {
					// Scroll down = next slide
					self.dd.setStep(self.current + 2);
				}
			}
		});

		// Keyboard navigation events
		document.addEventListener('keydown', function(event) {
			var keyCode = event.keyCode || event.which,
				currentSlide = self.slides[self.current];

			if (self.isContent) {
				switch (keyCode) {
					case 38: // Up arrow key
						// Toggle content only if content is scrolled to topmost
						if (currentSlide.scrollTop === 0) {
							self._toggleContent(currentSlide);
						}
						break;
				}
			} else {
				switch (keyCode) {
					case 40: // Down arrow key
						// Toggle content only if it's fullscreen
						if (self.isFullscreen) {
							self._toggleContent(currentSlide);
						}
						break;
					case 37: // Left arrow key
						self.dd.setStep(self.current);
						break;
					case 39: // Right arrow key
						self.dd.setStep(self.current + 2);
						break;
				}
			}
		});
	}

	/**
	 * Function to toggle between fullscreen and minimized slideshow
	 */
	DragSlideshow.prototype.toggle = function() {
		var self = this,
			p = self.options.perspective,
			r = self.options.slideshowRatio,
			zAxisVal = self.isFullscreen ? p - ( p / r ) : p - p * r;

		if (self.isAnimating) return false;
		self.isAnimating = true;

		// Add preserve-3d to the slides (seems to fix a rendering problem in firefox)
		self._preserve3dSlides(true);

		// Callback
		self.options.onToggle();

		// Toggle switch classes
		classie.remove(self.el, self.isFullscreen ? self.options.class.switchMax : self.options.class.switchMin);
		classie.add(self.el, self.isFullscreen ? self.options.class.switchMin : self.options.class.switchMax);

		self.slider.style.WebkitTransform = 'perspective(' + p + 'px) translate3d(0, 0, ' + zAxisVal + 'px)';
		self.slider.style.transform = 'perspective(' + p + 'px) translate3d(0, 0, ' + zAxisVal + 'px)';

		var onEndTransitionFn = function(event) {
			if (support.transitions) {
				if (event.propertyName.indexOf('transform') === -1) return;
				this.removeEventListener(transEndEventName, onEndTransitionFn);
			}

			if (!self.isFullscreen) {
				// Remove preserve-3d to the slides (seems to fix a rendering problem in firefox)
				self._preserve3dSlides();
			}

			// Remove switch classes
			classie.remove(self.el, self.isFullscreen ? self.options.class.switchMin : self.options.class.switchMax);

			// Toggle slider classes
			classie.remove(this, self.isFullscreen ? self.options.class.sliderLarge : self.options.class.sliderSmall);
			classie.add(this, self.isFullscreen ? self.options.class.sliderSmall : self.options.class.sliderLarge);

			// Reset transforms and set width & height
			self.slider.style.WebkitTransform = 'translate3d(0, 0, 0)';
			self.slider.style.transform = 'translate3d(0, 0, 0)';
			this.style.width = self.isFullscreen ? r * self.options.sliderWidthPct + '%' : null;
			this.style.height = self.isFullscreen ? r * self.options.sliderHeightPct + '%' : null;

			// Reinstatiate the dragger with the "reflow" method
			self.dd.reflow();

			self.isFullscreen = !self.isFullscreen;
			self.isAnimating = false;
		};

		if (support.transitions) {
			self.slider.addEventListener(transEndEventName, onEndTransitionFn);
		} else {
			onEndTransitionFn();
		}
	}

	/**
	 * Function to show/hide slide content
	 */
	DragSlideshow.prototype._toggleContent = function(slide) {
		var self = this,
			container = slide.querySelector(self.options.element.contentSwitchContainer);

		if (self.isAnimating) return false;
		self.isAnimating = true;

		// Callback
		self.options.onToggleContent();

		if (self.isContent) {
			// Enable the dragdealer
			self.dd.enable();
			classie.remove(self.el, self.options.class.showContent);
			classie.remove(slide, self.options.class.show);
			slide.style.width = self.originalWidth;
			slide.style.margin = self.originalMargin;
			container.style.position = null;
			container.style.width = null;
		} else {
			// Disable the dragdealer
			self.dd.disable();
			classie.add(self.el, self.options.class.switchShow);
			classie.add(self.el, self.options.class.showContent);
			classie.add(slide, self.options.class.show);
			slide.style.width = self.toggledWidth;
			slide.style.margin = null;
			slide.scrollTop = 0;
		}

		var onEndTransitionFn = function(event) {
			if (support.transitions) {
				if (event.propertyName.indexOf('transform') === -1 || event.target !== this) return;
				this.removeEventListener(transEndEventName, onEndTransitionFn);
			}

			// Set properties after the transition ended
			if (self.isContent) {
				classie.remove(self.el, self.options.class.switchShow);
			} else {
				container.style.position = 'fixed';
				container.style.width = self.toggledWidth;
			}

			self.isContent = !self.isContent;
			self.isAnimating = false;

			// Callback
			self.options.onToggleContentComplete();
		};

		if (support.transitions) {
			self.el.addEventListener(transEndEventName, onEndTransitionFn);
		} else {
			onEndTransitionFn();
		}
	}

	/**
	 * Function to add/remove preserve-3d to the slides
	 * (seems to fix a rendering problem in firefox)
	 */
	DragSlideshow.prototype._preserve3dSlides = function(add) {
		this.slides.forEach(function(slide) {
			slide.style.transformStyle = add ? 'preserve-3d' : '';
		});
	}

	// Add to global namespace
	window.DragSlideshow = DragSlideshow;

}) (window);
