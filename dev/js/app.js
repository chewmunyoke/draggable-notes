let mapState = Vuex.mapState;
let mapGetters = Vuex.mapGetters;

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

let headerComponent = {
	template: '#header-component',
	data() {
		return {
			appTitle: this.$store.state.appTitle,
			appMessage: this.$store.state.appMessage
		}
	},
	computed: {
		headerClass: function() {
			return {
				'hide': this.$store.state.status.appIsSwitchShow
			};
		},
		draggerButtonClass: function() {
			return {
				'view-max': this.$store.state.status.draggerButtonIsToggled
			}
		}
	},
	methods: {
		draggerClickHandler: function() {
			this.$store.commit('toggle');
		}
	}
};

function initEvents() {
	document.addEventListener('mousewheel', function(event) {
		if (!app.status.isContent) {
			if (event.deltaY < 0) {
				// Scroll up = previous slide
				app.elements.dd.setStep(app.status.current);
			} else {
				// Scroll down = next slide
				app.elements.dd.setStep(app.status.current + 2);
			}
		}
	});

	document.addEventListener('keydown', function(event) {
		let keyCode = event.keyCode || event.which,
			currentSlide = app.elements.slides[app.status.current];

		if (app.status.isContent && !app.status.isEditing) {
			switch (keyCode) {
				case 38: // Up arrow key
					// Toggle content only if content is scrolled to topmost
					if (currentSlide.scrollTop === 0) {
						app.$store.commit('toggleContent', currentSlide);
					}
					break;
			}
		} else {
			switch (keyCode) {
				case 40: // Down arrow key
					// Toggle content only if it's fullscreen
					if (app.status.isFullscreen) {
						app.$store.commit('toggleContent', currentSlide);
					}
					break;
				case 37: // Left arrow key
					app.elements.dd.setStep(app.status.current);
					break;
				case 39: // Right arrow key
					app.elements.dd.setStep(app.status.current + 2);
					break;
			}
		}
	});
}

function initDD() {
	app.elements = {
		slideshow: app.$el.querySelector('.slideshow'),
		dragger: app.$el.querySelector('.dragger'),
		handle: app.$el.querySelector('.handle')
	};
	app.elements.slides = [].slice.call(app.elements.handle.children);

	app.elements.dd = new Dragdealer(app.elements.dragger, {
		steps: app.notes.length,
		speed: 0.3,
		loose: true,
		callback: function(x, y) {
			app.$store.commit('currentNote', app.elements.dd.getStep()[0] - 1);
		}
	});

	initEvents();
}

var app = new Vue({
	store,
	el: '#app',
	components: {
		'header-component': headerComponent
	},
	computed: {
		...mapState([
			'status',
			'user',
			'notes'
		]),
		...mapGetters([
			'slideshowClass',
			'draggerClass',
			'draggerStyle',
			'handleStyle',
			'slideClass',
			'slideStyle',
			'containerStyle'
		])
	},
	methods: {
		slideClickHandler: function(index) {
			this.$store.commit('slideClickHandler', index);
		},
		contentSwitchHandler: function() {
			this.$store.commit('contentSwitchHandler');
		},
		contentEditHandler: function(index) {
			this.$store.commit('contentEditHandler', index);
		},
		contentSaveHandler: function(index) {
			this.$store.commit('contentSaveHandler', index);
		},
		contentCancelHandler: function() {
			this.$store.commit('contentCancelHandler');
		}
	},
	mounted: function() {
		this.$store.dispatch('fetchData').then(function() {
			initDD();
		});
	}
});
