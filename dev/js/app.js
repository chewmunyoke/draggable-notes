//const Dragdealer = require('./dragdealer.js');
//import headerComponent from './header.vue';

let docElem = window.document.documentelements,
	transEndEventNames = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'msTransition': 'MSTransitionEnd',
		'transition': 'transitionend'
	},
	transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
	support = {transitions : Modernizr.csstransitions};

let data = {
	// App initial state
	state: {
		current: 0,
		isDisplayed: false,
		isFullscreen: true,
		isContent: false,
		isAnimating: false,
		appIsSwitchMax: false,
		appIsSwitchMin: false,
		appIsSwitchShow: false,
		appIsShowContent: false,
		draggerButtonIsToggled: false,
		draggerIsToggled: false,
		draggerIsTransforming: false,
		slideIsShow: false,
		containerIsFixed: false,
		preserve3dSlides: false // fixes rendering problem in firefox
	},
	// App default options
	options: {
		perspective: 1200,
		slideshowRatio: 0.3,
		draggerWidthPct: 100,
		draggerHeightPct: 60,
		slideWidthPct: 80,
		slideContentMargin: 20
	},
	user: {},
	notes: []
};

let headerComponent = {
	template: '#header-component',
	props: ['state'],
	data() {
		return {
			appTitle: 'Draggable Notes',
			appMessage: 'This mobile version does not have the slideshow switch'
		}
	},
	computed: {
		headerClass: function() {
			return {
				'hide': this.state.appIsSwitchShow
			};
		},
		draggerButtonClass: function() {
			return {
				'view-max': this.state.draggerButtonIsToggled
			}
		}
	},
	methods: {
		draggerClickHandler: function(event) {
			app.toggle();
		}
	}
};

function fetchData() {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let newData = JSON.parse(this.responseText);
			newData.notes.forEach(function(note) {
				note.datestamp = moment(note.timestamp).format('LLLL');
				note.lastUpdated = moment(note.timestamp).fromNow();
				note.content = '<p>' + note.content + '</p>';
				note.content = note.content.replace(/\n/g, '</p><p>');
				app.notes.push(note);
			});
			app.user = newData.user;
			initDD();
		}
	};
	//xhr.open('GET', 'https://jsonblob.com/api/jsonBlob/a0b77c20-4699-11e8-b581-9fcf0c943dad', true);
	xhr.open('GET', 'https://api.jsonbin.io/b/5adde191003aec63328dc0e1', true);
	xhr.send();
}

function initDD() {
	Vue.nextTick(function() {
		app.elements = {
			slideshow: app.$el.querySelector('.slideshow'),
			dragger: app.$el.querySelector('.dragger'),
			handle: app.$el.querySelector('.handle')
		};
		app.elements.slides = [].slice.call(app.elements.handle.children);

		app.dd = new Dragdealer(app.elements.dragger, {
			steps: app.notesCount,
			speed: 0.3,
			loose: true,
			callback: function(x, y) {
				app.state.current = app.dd.getStep()[0] - 1;
			}
		});

		document.addEventListener('mousewheel', function(event) {
			if (!app.state.isContent) {
				if (event.deltaY < 0) {
					// Scroll up = previous slide
					app.dd.setStep(app.state.current);
				} else {
					// Scroll down = next slide
					app.dd.setStep(app.state.current + 2);
				}
			}
		});

		document.addEventListener('keydown', function(event) {
			let keyCode = event.keyCode || event.which,
				currentSlide = app.elements.slides[app.state.current];

			if (app.state.isContent) {
				switch (keyCode) {
					case 38: // Up arrow key
						// Toggle content only if content is scrolled to topmost
						if (currentSlide.scrollTop === 0) {
							app._toggleContent(currentSlide);
						}
						break;
				}
			} else {
				switch (keyCode) {
					case 40: // Down arrow key
						// Toggle content only if it's fullscreen
						if (app.state.isFullscreen) {
							app._toggleContent(currentSlide);
						}
						break;
					case 37: // Left arrow key
						app.dd.setStep(app.state.current);
						break;
					case 39: // Right arrow key
						app.dd.setStep(app.state.current + 2);
						break;
				}
			}
		});
	});
	app.state.isDisplayed = true;
}

var app = new Vue({
	el: '#app',
	components: {
		'header-component': headerComponent
	},
	data: data,
	computed: {
		notesCount: function() {
			// TODO if zero
			return this.notes.length;
		},
		zAxis: function() {
			return this.state.isFullscreen ?
				(this.options.perspective - (this.options.perspective / this.options.slideshowRatio)) :
				(this.options.perspective - (this.options.perspective * this.options.slideshowRatio));
		},
		slideIntialWidth: function() {
			return (this.options.slideWidthPct / this.notesCount) + '%';
		},
		slideInitialMargin: function() {
			return '0 ' + (((this.options.draggerWidthPct - this.options.slideWidthPct) / 2) / this.notesCount) + '%';
		},
		slideContentWidth: function() {
			return 'calc(' + (this.options.draggerWidthPct / this.notesCount) + '% - ' + this.options.slideContentMargin + 'px';
		},
		draggerToggledWidth: function() {
			return this.options.slideshowRatio * this.options.draggerWidthPct + '%';
		},
		draggerToggledHeight: function() {
			return this.options.slideshowRatio * this.options.draggerHeightPct + '%';
		},
		handleWidth: function() {
			return this.notesCount * this.options.draggerWidthPct + '%';
		},
		slideshowClass: function() {
			return {
				'switch-max': this.state.appIsSwitchMax,
				'switch-min': this.state.appIsSwitchMin,
				'switch-show': this.state.appIsSwitchShow,
				'show-content': this.state.appIsShowContent
			};
		},
		draggerClass: function() {
			return {
				'dragger-large': !this.state.draggerIsToggled,
				'dragger-small': this.state.draggerIsToggled
			};
		},
		draggerStyle: function() {
			return {
				// TODO prefix
				'width': this.state.draggerIsToggled ? this.draggerToggledWidth : null,
				'height': this.state.draggerIsToggled ? this.draggerToggledHeight : null,
				'transform': this.state.draggerIsTransforming ?
					'perspective(' + this.options.perspective + 'px) translate3d(0, 0, ' + this.zAxis + 'px)' :
					'translate3d(0, 0, 0)'
			};
		},
		handleStyle: function() {
			return {
				'width': this.handleWidth
			};
		}
	},
	methods: {
		slideClass: function(index) {
			return {
				'current': index == this.state.current,
				'previous': index == this.state.current - 1,
				'next': index == this.state.current + 1,
				'show': index == this.state.current && this.state.slideIsShow
			};
		},
		slideStyle: function(index) {
			return {
				'width': index == this.state.current && this.state.slideIsShow ? this.slideContentWidth : this.slideIntialWidth,
				'margin': index == this.state.current && this.state.slideIsShow ? null : this.slideInitialMargin,
				'transform-style': this.state.preserve3dSlides ? 'preserve-3d' : null
			};
		},
		containerStyle: function(index) {
			return {
				'position': index == this.state.current && this.state.containerIsFixed ? 'fixed' : null,
				'width': index == this.state.current && this.state.containerIsFixed ? this.slideContentWidth : null
			};
		},
		/**
		 * Function to toggle between fullscreen and minimized slideshow
		 */
		toggle: function() {
			if (this.state.isAnimating) return false;
			this.state.isAnimating = true;

			this.state.preserve3dSlides = true;

			// TODO callback
			//this.options.onToggle();

			// Add switch classes
			if (this.state.isFullscreen) {
				this.state.draggerButtonIsToggled = true;
				this.state.appIsSwitchMin = true;
			} else {
				this.state.draggerButtonIsToggled = false;
				this.state.appIsSwitchMax = true;
			}
			this.state.draggerIsTransforming = true;

			let onEndTransitionFn = function(event) {
				if (support.transitions) {
					if (event.propertyName.indexOf('transform') === -1 || event.target !== app.elements.dragger) return;
					this.removeEventListener(transEndEventName, onEndTransitionFn);
				}

				// Remove switch classes
				if (app.state.isFullscreen) {
					app.state.appIsSwitchMin = false;
					app.state.draggerIsToggled = true;
				} else {
					app.state.appIsSwitchMax = false;
					app.state.draggerIsToggled = false;
					app.state.preserve3dSlides = false;
				}
				app.state.draggerIsTransforming = false;

				app.state.isFullscreen = !app.state.isFullscreen;
				app.state.isAnimating = false;

				// To be executed after the DOM is updated with the computed class changes
				Vue.nextTick(function() {
					// Reinstatiate the dragger with the "reflow" method
					app.dd.reflow();
				});
			};

			if (support.transitions) {
				this.elements.dragger.addEventListener(transEndEventName, onEndTransitionFn);
			} else {
				onEndTransitionFn();
			}
		},
		/**
		 * Function to show/hide slide content
		 */
		_toggleContent: function(slide) {
			if (this.state.isAnimating) return false;
			this.state.isAnimating = true;

			// TODO callback
			// this.options.onToggleContent();

			if (this.state.isContent) {
				// Enable the dragdealer
				this.dd.enable();
				this.state.appIsShowContent = false;
				this.state.slideIsShow = false;
				this.state.containerIsFixed = false;
			} else {
				// Disable the dragdealer
				this.dd.disable();
				this.state.appIsSwitchShow = true;
				this.state.appIsShowContent = true;
				this.state.slideIsShow = true;
				slide.scrollTop = 0;
			}

			let onEndTransitionFn = function(event) {
				if (support.transitions) {
					if (event.propertyName.indexOf('transform') === -1 || event.target !== app.elements.slideshow) return;
					this.removeEventListener(transEndEventName, onEndTransitionFn);
				}

				// Set properties after transition ended
				if (app.state.isContent) {
					app.state.appIsSwitchShow = false;
				} else {
					app.state.containerIsFixed = true;
				}

				app.state.isContent = !app.state.isContent;
				app.state.isAnimating = false;

				// TODO Callback
				// app.options.onToggleContentComplete();
			};

			if (support.transitions) {
				this.elements.slideshow.addEventListener(transEndEventName, onEndTransitionFn);
			} else {
				onEndTransitionFn();
			}
		},
		slideClickHandler: function(index) {
			if (!this.state.isFullscreen && !this.state.isAnimating && !this.dd.activity) {
				if (index === this.state.current) {
					this.toggle();
				} else {
					this.dd.setStep(index + 1);
				}
			}
		},
		contentClickHandler: function(event) {
			this._toggleContent(app.elements.slides[this.state.current]);
		}
	},
	created: function() {
		setTimeout(function() {
			fetchData();
		}, 1000);
	}
});

//module.exports = app;
