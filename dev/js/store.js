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

//let debug = process.env.NODE_ENV !== 'production';
let debug = true;

var store = new Vuex.Store({
	strict: debug,
	plugins: debug ? [createLogger()] : [],
	state: {
		appTitle: 'Draggable Notes',
		appMessage: 'This mobile version does not have the slideshow switch',
		// App initial state
		status: {
			current: 'x',
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
			draggerWidth: 0,
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
			id: 0,
			name: "Test User",
			username: "test",
			password: "test"
		},
		notes: []
	},
	getters: {
		notesCount: function(state) {
			return state.notes.length;
		},
		noteIndex: function(state) {
			return function(noteID) {
				return state.notes.findIndex(function(note) {
					return note.id == noteID;
				});
			}
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
		slideLeftValue: function(state) {
			return (state.draggerWidth * 0.14) + 'px';
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
		headerClass: function(state) {
			return {
				'hide': state.status.appIsSwitchShow
			};
		},
		draggerButtonClass: function(state) {
			return {
				'view-max': state.status.draggerButtonIsToggled
			}
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
		slideClass: function(state, getters) {
			return function(noteID) {
				let index = getters.noteIndex(noteID);
				let currentIndex = getters.noteIndex(state.status.current);
				return {
					'current': index == currentIndex,
					'previous': index == currentIndex - 1,
					'next': index == currentIndex + 1,
					'show': index == currentIndex && state.status.slideIsShow
				};
			};
		},
		slideStyle: function(state, getters) {
			return function(noteID) {
				/*
				let left = null;
				if (!state.status.slideIsShow) {
					if (getters.slideClass(noteID).previous) {
						left = getters.slideLeftValue;
					} else if (getters.slideClass(noteID).next) {
						left = '-' + getters.slideLeftValue;
					}
				}
				*/
				return {
					//'left': left,
					'width': noteID == state.status.current && state.status.slideIsShow ? getters.slideContentWidth : getters.slideIntialWidth,
					'margin': noteID == state.status.current && state.status.slideIsShow ? null : getters.slideInitialMargin,
					'transform-style': state.status.preserve3dSlides ? 'preserve-3d' : null
				};
			};
		},
		containerStyle: function(state, getters) {
			return function(noteID) {
				return {
					'position': noteID == state.status.current && state.status.containerIsFixed ? 'fixed' : null,
					'width': noteID == state.status.current && state.status.containerIsFixed ? getters.slideContentWidth : null
				};
			};
		}
	},
	mutations: {
		setUser(state, user) {
			for (let key in user) {
				//Vue.set(state.user, key, user[key]);
				state.user[key] = user[key];
			}
		},
		setCurrentNote(state, noteID) {
			state.status.current = noteID;
		},
		addNote(state, note) {
			state.notes.push(note);
		},
		saveNote(state, note) {
			let index = this.getters.noteIndex(note.id);
			for (let key in note) {
				state.notes[index][key] = note[key];
			}
		},
		deleteNote(state, noteID) {
			let index = this.getters.noteIndex(noteID);
			state.notes.splice(index, 1);
			window.elements.slides.splice(index, 1);
		},
		toggleStatus(state, params) {
			for (let key in params) {
				state.status[key] = params[key];
			}
		},
		updateDraggerWidth(state) {
			state.status.draggerWidth = window.elements.dragger.offsetWidth;
		}
	},
	actions: {
		login({commit, state}, credentials) {

		},
		fetchData({commit, state}, credentials) {
			return new Promise(function(resolve, reject) {
				let xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						let newData = JSON.parse(this.responseText);
						setTimeout(function() {
							commit('setUser', newData.user);
							if (newData.notes.length > 0) {
								newData.notes.forEach(function(note) {
									commit('addNote', setNote(note));
								});
								commit('setCurrentNote', newData.notes[0].id);
							} else {
								// TODO no notes
							}
							commit('toggleStatus', {'isDisplayed': true});
							resolve();
						}, 1000);
					}
				};
				//xhr.open('GET', 'https://jsonblob.com/api/jsonBlob/a0b77c20-4699-11e8-b581-9fcf0c943dad', true);
				xhr.open('GET', 'https://api.jsonbin.io/b/5adde191003aec63328dc0e1/6', true);
				xhr.send();
			});
		},
		initElements({commit, state}, stepIndex) {
			let self = this;
			Vue.nextTick().then(function() {
				window.elements.slides = [].slice.call(window.elements.handle.children);
				window.elements.dd = new Dragdealer(window.elements.dragger, {
					steps: state.notes.length,
					speed: 0.3,
					loose: true,
					callback: function(x, y) {
						let index = this.getStep()[0] - 1;
						if (isNaN(index)) index = 0;
						commit('setCurrentNote', state.notes[index].id);
					}
				});
				window.elements.dd.setStep(stepIndex);
			});
		},
		initEvents({commit, state}) {
			let self = this;

			window.addEventListener('resize', function(event) {
				commit('updateDraggerWidth');
			});

			document.addEventListener('mousewheel', function(event) {
				if (!state.status.isContent) {
					let index = self.getters.noteIndex(state.status.current);
					if (event.deltaY < 0) {
						// Scroll up = previous slide
						window.elements.dd.setStep(index);
					} else {
						// Scroll down = next slide
						window.elements.dd.setStep(index + 2);
					}
				}
			});

			document.addEventListener('keydown', function(event) {
				let keyCode = event.keyCode || event.which;

				if (state.status.isContent && !state.status.isEditing) {
					switch (keyCode) {
						case 38: // Up arrow key
							// Toggle content only if content is scrolled to topmost
							if (currentSlide.scrollTop === 0) {
								this.dispatch('toggleContent');
							}
							break;
					}
				} else {
					let index = self.getters.noteIndex(state.status.current);
					switch (keyCode) {
						case 40: // Down arrow key
							// Toggle content only if it's fullscreen
							if (state.status.isFullscreen) {
								this.dispatch('toggleContent');
							}
							break;
						case 37: // Left arrow key
							window.elements.dd.setStep(index);
							break;
						case 39: // Right arrow key
							window.elements.dd.setStep(index + 2);
							break;
					}
				}
			});
		},
		draggerClickHandler({commit, state}) {
			this.dispatch('toggle');
		},
		slideClickHandler({commit, state}, noteID) {
			if (!state.status.isFullscreen && !state.status.isAnimating && !window.elements.dd.activity) {
				if (noteID === state.status.current) {
					this.dispatch('toggle');
				} else {
					let index = this.getters.noteIndex(noteID);
					window.elements.dd.setStep(index + 1);
				}
			}
		},
		contentSwitchHandler({commit, state}) {
			this.dispatch('toggleContent');
		},
		contentEditHandler({commit, state}, noteID) {
			commit('toggleStatus', {'isEditing': true});
			Vue.nextTick(function() {
				window.elements.editor = new Quill('#content-' + noteID, {
					theme: 'snow',
					modules: {
						toolbar: toolbarOptions
					}
				});
			});
		},
		contentDeleteHandler({commit, state}, noteID) {
			this.dispatch('toggleContent');

			let index = this.getters.noteIndex(noteID);
			let stepIndex = index;
			if (index <= 0) {
				// If the first note is deleted
				stepIndex = 1;
			} else if (index >= this.getters.notesCount - 1) {
				// If the last note is deleted
				stepIndex = index;
			} else {
				stepIndex = index + 1;
			}

			commit('deleteNote', noteID);

			if (this.getters.notesCount == 0) {
				// TODO
				alert('All notes deleted!');
			} else {
				this.dispatch('initElements', stepIndex);
			}
		},
		contentSaveHandler({commit, state}, note) {
			// If there are changes, save
			// Else, cancel
			let index = this.getters.noteIndex(note.id);
			console.log(note.title == state.notes[index].title)
			console.log(note.content == state.notes[index].content)
			console.log(note.content)
			console.log(state.notes[index].content)
			if (note.title != state.notes[index].title
				|| note.content != state.notes[index].content) {
					note.timestamp = moment().valueOf();
					commit('saveNote', setNote(note));
				}
			commit('toggleStatus', {'isEditing': false});
		},
		contentCancelHandler({commit, state}) {
			commit('toggleStatus', {'isEditing': false});
		},
		/**
		 * Function to toggle between fullscreen and minimized slideshow
		 */
		toggle({commit, state}) {
			if (state.status.isAnimating) return false;

			// Callback
			//state.options.onToggle();

			let status = {
				'isAnimating': true,
				'preserve3dSlides': true,
				'draggerIsTransforming': true
			};
			// Add switch classes
			if (state.status.isFullscreen) {
				status['draggerButtonIsToggled'] = true;
				status['appIsSwitchMin'] = true;
			} else {
				status['draggerButtonIsToggled'] = false;
				status['appIsSwitchMax'] = true;
			}
			commit('toggleStatus', status);

			let self = this;
			let onEndTransitionFn = function(event) {
				if (support.transitions) {
					if (event.propertyName.indexOf('transform') === -1 || event.target !== window.elements.dragger) return;
					this.removeEventListener(transEndEventName, onEndTransitionFn);
				}
				self.dispatch('toggleEnd');
			};

			if (support.transitions) {
				window.elements.dragger.addEventListener(transEndEventName, onEndTransitionFn);
			} else {
				onEndTransitionFn();
			}
		},
		toggleEnd({commit, state}) {
			let status = {
				'isAnimating': false,
				'isFullscreen': !state.status.isFullscreen,
				'draggerIsTransforming': false
			};
			// Remove switch classes
			if (state.status.isFullscreen) {
				status['appIsSwitchMin'] = false;
				status['draggerIsToggled'] = true;
			} else {
				status['appIsSwitchMax'] = false;
				status['draggerIsToggled'] = false;
				status['preserve3dSlides'] = false;
			}
			commit('toggleStatus', status);

			// To be executed after the DOM is updated with the computed class changes
			Vue.nextTick().then(function() {
				// Reinstatiate the dragger with the "reflow" method
				window.elements.dd.reflow();
			});
		},
		/**
		 * Function to show/hide slide content
		 */
		toggleContent({commit, state}) {
			if (state.status.isAnimating) return false;

			// Callback
			// state.options.onToggleContent();

			let slide = document.querySelector('#slide-' + state.status.current);
			slide.scrollTop = 0;

			let status = {
				'isAnimating': true
			};
			if (state.status.isContent) {
				window.elements.dd.enable();
				window.elements.dd.bindEventListeners();
				status['appIsShowContent'] = false;
				status['slideIsShow'] = false;
				status['containerIsFixed'] = false;
			} else {
				window.elements.dd.disable();
				window.elements.dd.unbindEventListeners();
				status['appIsSwitchShow'] = true;
				status['appIsShowContent'] = true;
				status['slideIsShow'] = true;
			}
			commit('toggleStatus', status);

			let self = this;
			let onEndTransitionFn = function(event) {
				if (support.transitions) {
					if (event.propertyName.indexOf('transform') === -1 || event.target !== window.elements.slideshow) return;
					this.removeEventListener(transEndEventName, onEndTransitionFn);
				}
				self.dispatch('toggleContentEnd');
			};

			if (support.transitions) {
				window.elements.slideshow.addEventListener(transEndEventName, onEndTransitionFn);
			} else {
				onEndTransitionFn();
			}
		},
		toggleContentEnd({commit, state}) {
			let status = {
				'isAnimating': false,
				'isContent': !state.status.isContent
			};
			// Set properties after transition ended
			if (state.status.isContent) {
				status['appIsSwitchShow'] = false;
			} else {
				status['containerIsFixed'] = true;
			}
			commit('toggleStatus', status);

			// Callback
			// state.options.onToggleContentComplete();
		}
	}
});

function setNote(note) {
	note.datestamp = moment(note.timestamp).format('LLLL');
	note.lastUpdated = moment(note.timestamp).fromNow();
	return note;
}
