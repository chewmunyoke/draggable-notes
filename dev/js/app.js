let mapState = Vuex.mapState;
let mapGetters = Vuex.mapGetters;
let mapMutations = Vuex.mapMutations;

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
	computed: {
		...mapState([
			'appTitle',
			'appMessage'
		]),
		...mapGetters([
			'headerClass',
			'draggerButtonClass'
		])
	},
	methods: {
		draggerClickHandler: function() {
			this.$store.commit('draggerClickHandler', this.$parent);
		}
	}
	/*
	methods: {
		...mapMutations([
			'draggerClickHandler'
		])
	}*/
};

let app = new Vue({
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
			this.$store.commit('slideClickHandler', this, index);
		},
		contentSwitchHandler: function() {
			this.$store.commit('contentSwitchHandler', this);
		},
		contentEditHandler: function(index) {
			this.$store.commit('contentEditHandler', this, index);
		},
		contentDeleteHandler: function(index) {
			// TODO confirmation
			if (confirm('Are you sure you want to delete this note?')) {
				this.$store.commit('contentDeleteHandler', index);
			}
		},
		contentSaveHandler: function(index) {
			// TODO show progress spinner
			this.$store.commit('contentSaveHandler', this, index);
		},
		contentCancelHandler: function() {
			this.$store.commit('contentCancelHandler');
		}
	},
	mounted: function() {
		let app = this;
		this.$store.dispatch('fetchData').then(function() {
			initDD(app);
		});
	}
});

function initDD(app) {
	let elements = {
		slideshow: app.$el.querySelector('.slideshow'),
		dragger: app.$el.querySelector('.dragger'),
		handle: app.$el.querySelector('.handle')
	};
	elements.slides = [].slice.call(elements.handle.children);

	elements.dd = new Dragdealer(elements.dragger, {
		steps: app.notes.length,
		speed: 0.3,
		loose: true,
		callback: function(x, y) {
			app.$store.commit('setCurrentNote', this.getStep()[0] - 1);
		}
	});
	app.elements = elements;
	initEvents(app);
}

function initEvents(app) {
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
		let keyCode = event.keyCode || event.which;

		if (app.status.isContent && !app.status.isEditing) {
			switch (keyCode) {
				case 38: // Up arrow key
					// Toggle content only if content is scrolled to topmost
					if (currentSlide.scrollTop === 0) {
						app.$store.commit('toggleContent', app);
					}
					break;
			}
		} else {
			switch (keyCode) {
				case 40: // Down arrow key
					// Toggle content only if it's fullscreen
					if (app.status.isFullscreen) {
						app.$store.commit('toggleContent', app);
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
