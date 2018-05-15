<template>
	<section class="main" v-cloak>
		<header-component
			:status="status">
		</header-component>
		<slideshow-component
			:status="status"
			:notes="notes">
		</slideshow-component>
	</section>
</template>

<script>
	import Vue from 'vue';
	import Vuex from 'vuex';
	import { mapState } from 'vuex';
	import moment from 'moment';
	import Quill from 'quill';
	import Dragdealer from '../dragdealer.js';

	import HeaderComponent from './header.vue';
	import SlideshowComponent from './slideshow.vue';

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

	let toolbarOptions = [
		//[{ 'font': [] }, { 'size': [] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ 'script': 'sub'}, { 'script': 'super' }],
		//[{ 'color': [] }, { 'background': [] }],
		[{ 'list': 'ordered'}, { 'list': 'bullet' }],
		['blockquote', 'code-block', 'link'],
		['clean']
	];

	Vue.use(Vuex);
	let store = new Vuex.Store({
		state: {
			appTitle: 'Draggable Notes',
			appMessage: 'This mobile version does not have the slideshow switch',
			// App initial state
			status: {
				current: 0,
				isDisplayed: false,
				isFullscreen: true,
				isContent: false,
				isEditing: false,
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
				preserve3dSlides: false, // fixes rendering problem in firefox
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
			user: {
				user_id: 0,
				name: "Test User",
				username: "test",
				password: "test"
			},
			notes: []
		},
		getters: {
			notesCount: function(state) {
				// TODO if zero
				return state.notes.length;
			},
			zAxis: function(state) {
				return state.status.isFullscreen ?
					(state.options.perspective - (state.options.perspective / state.options.slideshowRatio)) :
					(state.options.perspective - (state.options.perspective * state.options.slideshowRatio));
			},
			slideIntialWidth: function(state, getters) {
				return (state.options.slideWidthPct / getters.notesCount) + '%';
			},
			slideInitialMargin: function(state, getters) {
				return '0 ' + (((state.options.draggerWidthPct - state.options.slideWidthPct) / 2) / getters.notesCount) + '%';
			},
			slideContentWidth: function(state, getters) {
				return 'calc(' + (state.options.draggerWidthPct / getters.notesCount) + '% - ' + state.options.slideContentMargin + 'px';
			},
			draggerToggledWidth: function(state) {
				return state.options.slideshowRatio * state.options.draggerWidthPct + '%';
			},
			draggerToggledHeight: function(state) {
				return state.options.slideshowRatio * state.options.draggerHeightPct + '%';
			},
			handleWidth: function(state, getters) {
				return getters.notesCount * state.options.draggerWidthPct + '%';
			},
			slideshowClass: function(state) {
				return {
					'switch-max': state.status.appIsSwitchMax,
					'switch-min': state.status.appIsSwitchMin,
					'switch-show': state.status.appIsSwitchShow,
					'show-content': state.status.appIsShowContent
				};
			},
			draggerClass: function(state) {
				return {
					'dragger-large': !state.status.draggerIsToggled,
					'dragger-small': state.status.draggerIsToggled
				};
			},
			draggerStyle: function(state, getters) {
				return {
					// TODO prefix
					'width': state.status.draggerIsToggled ? getters.draggerToggledWidth : null,
					'height': state.status.draggerIsToggled ? getters.draggerToggledHeight : null,
					'transform': state.status.draggerIsTransforming ?
						'perspective(' + state.options.perspective + 'px) translate3d(0, 0, ' + getters.zAxis + 'px)' :
						'translate3d(0, 0, 0)'
				};
			},
			handleStyle: function(state, getters) {
				return {
					'width': getters.handleWidth
				};
			},
			slideClass: function(state) {
				return function(index) {
					return {
						'current': index == state.status.current,
						'previous': index == state.status.current - 1,
						'next': index == state.status.current + 1,
						'show': index == state.status.current && state.status.slideIsShow
					};
				};
			},
			slideStyle: function(state, getters) {
				return function(index) {
					return {
						'width': index == state.status.current && state.status.slideIsShow ? getters.slideContentWidth : getters.slideIntialWidth,
						'margin': index == state.status.current && state.status.slideIsShow ? null : getters.slideInitialMargin,
						'transform-style': state.status.preserve3dSlides ? 'preserve-3d' : null
					};
				};
			},
			containerStyle: function(state, getters) {
				return function(index) {
					return {
						'position': index == state.status.current && state.status.containerIsFixed ? 'fixed' : null,
						'width': index == state.status.current && state.status.containerIsFixed ? getters.slideContentWidth : null
					};
				};
			}
		},
		mutations: {
			login(state, user) {
				Object.keys(user).forEach(function(key) {
					state.user[key] = user[key];
				});
			},
			loadNotes(state, notes) {
				notes.forEach(function(note) {
					note.datestamp = moment(note.timestamp).format('LLLL');
					note.lastUpdated = moment(note.timestamp).fromNow();
					state.notes.push(note);
				});
			},
			currentNote(state, index) {
				state.status.current = index;
			},
			display(state, flag) {
				state.status.isDisplayed = flag;
			},
			/**
			 * Function to toggle between fullscreen and minimized slideshow
			 */
			toggle(state) {
				if (state.status.isAnimating) return false;
				state.status.isAnimating = true;

				state.status.preserve3dSlides = true;

				// TODO callback
				//state.options.onToggle();

				// Add switch classes
				if (state.status.isFullscreen) {
					state.status.draggerButtonIsToggled = true;
					state.status.appIsSwitchMin = true;
				} else {
					state.status.draggerButtonIsToggled = false;
					state.status.appIsSwitchMax = true;
				}
				state.status.draggerIsTransforming = true;

				let onEndTransitionFn = function(event) {
					if (support.transitions) {
						if (event.propertyName.indexOf('transform') === -1 || event.target !== app.elements.dragger) return;
						this.removeEventListener(transEndEventName, onEndTransitionFn);
					}

					// Remove switch classes
					if (state.status.isFullscreen) {
						state.status.appIsSwitchMin = false;
						state.status.draggerIsToggled = true;
					} else {
						state.status.appIsSwitchMax = false;
						state.status.draggerIsToggled = false;
						state.status.preserve3dSlides = false;
					}
					state.status.draggerIsTransforming = false;

					state.status.isFullscreen = !state.status.isFullscreen;
					state.status.isAnimating = false;

					// To be executed after the DOM is updated with the computed class changes
					Vue.nextTick(function() {
						// Reinstatiate the dragger with the "reflow" method
						app.elements.dd.reflow();
					});
				};

				if (support.transitions) {
					app.elements.dragger.addEventListener(transEndEventName, onEndTransitionFn);
				} else {
					onEndTransitionFn();
				}
			},
			/**
			 * Function to show/hide slide content
			 */
			toggleContent(state, slide) {
				if (state.status.isAnimating) return false;
				state.status.isAnimating = true;

				// TODO callback
				// state.options.onToggleContent();

				slide.scrollTop = 0;
				if (state.status.isContent) {
					// Enable the dragdealer
					app.elements.dd.enable();
					app.elements.dd.bindEventListeners();
					state.status.appIsShowContent = false;
					state.status.slideIsShow = false;
					state.status.containerIsFixed = false;
				} else {
					// Disable the dragdealer
					app.elements.dd.disable();
					app.elements.dd.unbindEventListeners();
					state.status.appIsSwitchShow = true;
					state.status.appIsShowContent = true;
					state.status.slideIsShow = true;
				}

				let onEndTransitionFn = function(event) {
					if (support.transitions) {
						if (event.propertyName.indexOf('transform') === -1 || event.target !== app.elements.slideshow) return;
						this.removeEventListener(transEndEventName, onEndTransitionFn);
					}

					// Set properties after transition ended
					if (app.status.isContent) {
						app.status.appIsSwitchShow = false;
					} else {
						app.status.containerIsFixed = true;
					}

					app.status.isContent = !app.status.isContent;
					app.status.isAnimating = false;

					// TODO Callback
					// app.options.onToggleContentComplete();
				};

				if (support.transitions) {
					app.elements.slideshow.addEventListener(transEndEventName, onEndTransitionFn);
				} else {
					onEndTransitionFn();
				}
			},
			slideClickHandler(state, index) {
				if (!state.status.isFullscreen && !state.status.isAnimating && !app.elements.dd.activity) {
					if (index === state.status.current) {
						this.commit('toggle');
					} else {
						app.elements.dd.setStep(index + 1);
					}
				}
			},
			contentSwitchHandler(state) {
				this.commit('toggleContent', app.elements.slides[state.status.current]);
			},
			contentEditHandler(state, index) {
				state.status.isEditing = true;
				Vue.nextTick(function() {
					app.editor = new Quill('#content-' + index, {
						theme: 'snow',
						modules: {
							toolbar: toolbarOptions
						}
					});
				});
			},
			contentSaveHandler(state, index) {
				// TODO
				let newTitle = app.$el.querySelector('#title-' + index).value;
				let newContent = app.editor.container.querySelector('.ql-editor').innerHTML;
				state.notes[index].title = newTitle;
				state.notes[index].content = newContent;
				state.status.isEditing = false;
			},
			contentCancelHandler(state) {
				state.status.isEditing = false;
			}
		},
		actions: {
			fetchData({commit, state}, credentials) {
				return new Promise(function(resolve, reject) {
					let xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
							let newData = JSON.parse(this.responseText);
							setTimeout(function() {
								commit('login', newData.user);
								commit('loadNotes', newData.notes);
								commit('display', true);
								resolve();
							}, 1000);
						}
					};
					//xhr.open('GET', 'https://jsonblob.com/api/jsonBlob/a0b77c20-4699-11e8-b581-9fcf0c943dad', true);
					xhr.open('GET', 'https://api.jsonbin.io/b/5adde191003aec63328dc0e1/2', true);
					xhr.send();
				});
			}
		}
	});

	var app;

	export default {
		store,
		name: 'app-component',
		components: {
			HeaderComponent,
			SlideshowComponent
		},
		computed: {
			...mapState([
				'status',
				'user',
				'notes'
			])
		},
		mounted: function() {
			app = this;
			this.$store.dispatch('fetchData').then(function() {
				initDD();
			});
		}
	};

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
							//EventBus.$emit('content-button-toggle', currentSlide);
							app.$store.commit('toggleContent', currentSlide);
						}
						break;
				}
			} else {
				switch (keyCode) {
					case 40: // Down arrow key
						// Toggle content only if it's fullscreen
						if (app.status.isFullscreen) {
							//EventBus.$emit('content-button-toggle', currentSlide);
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

</script>
