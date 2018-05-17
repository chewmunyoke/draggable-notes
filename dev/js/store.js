let toolbarOptions = [
	//[{ 'font': [] }, { 'size': [] }],
	['bold', 'italic', 'underline', 'strike'],
	[{ 'script': 'sub'}, { 'script': 'super' }],
	//[{ 'color': [] }, { 'background': [] }],
	[{ 'list': 'ordered'}, { 'list': 'bullet' }],
	['blockquote', 'code-block', 'link'],
	['clean']
];

var store = new Vuex.Store({
	strict: true, //process.env.NODE_ENV !== 'production',
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
			for (let key in user) {
				Vue.set(state.user, key, user[key]);
			}
		},
		loadNotes(state, notes) {
			notes.forEach(function(note) {
				note.datestamp = moment(note.timestamp).format('LLLL');
				note.lastUpdated = moment(note.timestamp).fromNow();
				state.notes.push(note);
			});
		},
		displayNotes(state, flag) {
			state.status.isDisplayed = flag;
		},
		setCurrentNote(state, index) {
			state.status.current = index;
		},
		/**
		 * Function to toggle between fullscreen and minimized slideshow
		 */
		toggle(state) {
			let self = this;

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
					if (event.propertyName.indexOf('transform') === -1 || event.target !== window.elements.dragger) return;
					this.removeEventListener(transEndEventName, onEndTransitionFn);
				}
				self.commit('toggleEnd');
			};

			if (support.transitions) {
				window.elements.dragger.addEventListener(transEndEventName, onEndTransitionFn);
			} else {
				onEndTransitionFn();
			}
		},
		toggleEnd(state) {
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
				window.elements.dd.reflow();
			});
		},
		/**
		 * Function to show/hide slide content
		 */
		toggleContent(state) {
			let self = this;

			if (state.status.isAnimating) return false;
			state.status.isAnimating = true;

			// TODO callback
			// state.options.onToggleContent();

			let slide = window.elements.slides[state.status.current];
			slide.scrollTop = 0;

			if (state.status.isContent) {
				// Enable the dragdealer
				window.elements.dd.enable();
				window.elements.dd.bindEventListeners();
				state.status.appIsShowContent = false;
				state.status.slideIsShow = false;
				state.status.containerIsFixed = false;
			} else {
				// Disable the dragdealer
				window.elements.dd.disable();
				window.elements.dd.unbindEventListeners();
				state.status.appIsSwitchShow = true;
				state.status.appIsShowContent = true;
				state.status.slideIsShow = true;
			}

			let onEndTransitionFn = function(event) {
				if (support.transitions) {
					if (event.propertyName.indexOf('transform') === -1 || event.target !== window.elements.slideshow) return;
					this.removeEventListener(transEndEventName, onEndTransitionFn);
				}
				self.commit('toggleContentEnd');
			};

			if (support.transitions) {
				window.elements.slideshow.addEventListener(transEndEventName, onEndTransitionFn);
			} else {
				onEndTransitionFn();
			}
		},
		toggleContentEnd(state) {
			// Set properties after transition ended
			if (state.status.isContent) {
				state.status.appIsSwitchShow = false;
			} else {
				state.status.containerIsFixed = true;
			}

			state.status.isContent = !state.status.isContent;
			state.status.isAnimating = false;

			// TODO Callback
			// state.options.onToggleContentComplete();
		},
		draggerClickHandler(state) {
			this.commit('toggle');
		},
		slideClickHandler(state, index) {
			if (!state.status.isFullscreen && !state.status.isAnimating && !window.elements.dd.activity) {
				if (index === state.status.current) {
					this.commit('toggle');
				} else {
					window.elements.dd.setStep(index + 1);
				}
			}
		},
		contentSwitchHandler(state) {
			this.commit('toggleContent');
		},
		contentEditHandler(state, index) {
			state.status.isEditing = true;
			Vue.nextTick(function() {
				window.elements.editor = new Quill('#content-' + index, {
					theme: 'snow',
					modules: {
						toolbar: toolbarOptions
					}
				});
			});
		},
		contentDeleteHandler(state, index) {
			this.commit('toggleContent');
			console.log(index + ', ' + this.getters.notesCount);
			if (index >= this.getters.notesCount - 1) {
				// If the last note is deleted
				window.elements.dd.setStep(index - 1);
			} else {
				window.elements.dd.setStep(index);
			}
			state.notes.splice(index, 1);
			// reinitialize dd?
			window.elements.dd.reflow();
		},
		contentSaveHandler(state, index) {
			let newTitle = document.querySelector('#title-' + index).value;
			let newContent = window.elements.editor.container.querySelector('.ql-editor').innerHTML;
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
							commit('displayNotes', true);
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
