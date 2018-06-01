
//let debug = process.env.NODE_ENV !=== 'production';
let debug = true;

let store = new Vuex.Store({
	strict: debug,
	plugins: debug ? [createLogger(), localStoragePlugin] : [],
	state: state,
	getters: {
		notesCount: function (state) {
			return state.notes.length;
		},
		noteIndex: function (state) {
			return function (noteID) {
				return state.notes.findIndex(function (note) {
					return note.id === noteID;
				});
			}
		},
		zAxis: function (state) {
			return state.status.isFullscreen ?
				(state.options.perspective - (state.options.perspective / state.options.slideshowRatio)) :
				(state.options.perspective - (state.options.perspective * state.options.slideshowRatio));
		},
		slideIntialWidth: function (state, getters) {
			return (state.options.slideWidthPct / getters.notesCount) + '%';
		},
		slideInitialMargin: function (state, getters) {
			return '0 ' + (((state.options.draggerWidthPct - state.options.slideWidthPct) / 2) / getters.notesCount) + '%';
		},
		slideContentWidth: function (state, getters) {
			return 'calc(' + (state.options.draggerWidthPct / getters.notesCount) + '% - ' + state.options.slideContentMargin + 'px';
		},
		slideLeftValue: function (state) {
			return (state.status.draggerWidth * 0.14) + 'px';
		},
		draggerToggledWidth: function (state) {
			return state.options.slideshowRatio * state.options.draggerWidthPct + '%';
		},
		draggerToggledHeight: function (state) {
			return state.options.slideshowRatio * state.options.draggerHeightPct + '%';
		},
		handleWidth: function (state, getters) {
			return getters.notesCount * state.options.draggerWidthPct + '%';
		},
		draggerButtonClass: function (state) {
			return {
				'view-max': state.status.draggerButtonIsToggled
			}
		},
		slideshowClass: function (state) {
			return {
				'switch-max': state.status.appIsSwitchMax,
				'switch-min': state.status.appIsSwitchMin,
				'switch-show': state.status.appIsSwitchShow,
				'show-content': state.status.slideIsShow
			};
		},
		draggerClass: function (state) {
			return {
				'dragger-large': !state.status.draggerIsToggled,
				'dragger-small': state.status.draggerIsToggled
			};
		},
		draggerStyle: function (state, getters) {
			return {
				// TODO prefix
				'width': state.status.draggerIsToggled ? getters.draggerToggledWidth : null,
				'height': state.status.draggerIsToggled ? getters.draggerToggledHeight : null,
				'transform': state.status.draggerIsTransforming ?
					'perspective(' + state.options.perspective + 'px) translate3d(0, 0, ' + getters.zAxis + 'px)' :
					'translate3d(0, 0, 0)'
			};
		},
		handleStyle: function (state, getters) {
			return {
				'width': getters.handleWidth
			};
		},
		slideClass: function (state, getters) {
			return function (noteID) {
				let index = getters.noteIndex(noteID);
				let currentIndex = getters.noteIndex(state.status.current);
				return {
					'current': index === currentIndex,
					'previous': index === currentIndex - 1,
					'next': index === currentIndex + 1,
					'show': index === currentIndex && state.status.slideIsShow
				};
			};
		},
		slideStyle: function (state, getters) {
			return function (noteID) {
				let index = getters.noteIndex(noteID);
				let currentIndex = getters.noteIndex(state.status.current);
				let left = null;
				if (!state.status.appIsSwitchMin && !state.status.appIsSwitchShow && !state.status.draggerIsToggled) {
					if (index === currentIndex - 1) {
						left = getters.slideLeftValue;
					} else if (index === currentIndex + 1) {
						left = '-' + getters.slideLeftValue;
					}
				}
				return {
					'left': left,
					'width': noteID === state.status.current && state.status.slideIsShow ? getters.slideContentWidth : getters.slideIntialWidth,
					'margin': noteID === state.status.current && state.status.slideIsShow ? null : getters.slideInitialMargin,
					'transform-style': state.status.preserve3dSlides ? 'preserve-3d' : null
				};
			};
		},
		containerStyle: function (state, getters) {
			return function (noteID) {
				return {
					'position': noteID === state.status.current && state.status.containerIsFixed ? 'fixed' : null,
					'width': noteID === state.status.current && state.status.containerIsFixed ? getters.slideContentWidth : null
				};
			};
		}
	},
	mutations: {
		setUser (state, user) {
			for (let key in user) {
				//Vue.set(state.user, key, user[key]);
				state.user[key] = user[key];
			}
			state.text.appMessage = 'Welcome, ' + user.name;
		},
		setCurrentNote (state, noteID) {
			state.status.current = noteID;
		},
		addNote (state, note) {
			state.notes.push(note);
		},
		saveNote (state, note) {
			let index = this.getters.noteIndex(note.id);
			for (let key in note) {
				state.notes[index][key] = note[key];
			}
		},
		deleteNote (state, noteID) {
			let index = this.getters.noteIndex(noteID);
			state.notes.splice(index, 1);
			window.elements.slides.splice(index, 1);
		},
		toggleStatus (state, params) {
			for (let key in params) {
				state.status[key] = params[key];
			}
		},
		updateDraggerWidth (state) {
			state.status.draggerWidth = window.elements.dragger.offsetWidth;
		}
	},
	actions: {
		login ({state, commit}, credentials) {

		},
		fetchData ({commit}, credentials) {
			return new Promise(function (resolve, reject) {
				let xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function () {
					if (this.readyState === 4 && this.status === 200) {
						let data = JSON.parse(this.responseText);
						setTimeout(function () {
							commit('setUser', data.user);
							// TODO HERE
							//data.notes.pop();
							//data.notes.pop();
							if (data.notes.length > 0) {
								data.notes.forEach(function (note) {
									commit('addNote', setNote(note));
								});
								commit('setCurrentNote', data.notes[0].id);
							} else {
								commit('toggleStatus', {'isEmpty': true});
							}
							let status = {
								'isLoading': false,
								'isDisplayed': true
							};
							commit('toggleStatus', status);
							resolve();
						}, 1000);
					}
				};
				xhr.open('GET', JSON_DATA, true);
				xhr.send();

				/*
				let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
				if (data) {
					commit('setUser', data.user);
					// TODO HERE
					//data.notes = [];
					if (data.notes.length > 0) {
						data.notes.forEach(function (note) {
							commit('addNote', setNote(note));
						});
						commit('setCurrentNote', data.notes[0].id);
					} else {
						commit('toggleStatus', {'isEmpty': true});
					}
					let status = {
						'isLoading': false,
						'isDisplayed': true
					};
					commit('toggleStatus', status);
					resolve();
				}
				*/
			});
		},
		initElements ({state, getters, commit}, stepIndex) {
			Vue.nextTick().then(function () {
				window.elements.slides = [].slice.call(window.elements.handle.children);
				if (window.elements.dd) {
					window.elements.dd.unbindEventListeners();
				}
				if (getters.notesCount > 0) {
					if (state.status.isEmpty) {
						commit('toggleStatus', {'isEmpty': false});
					}
					window.elements.dd = new Dragdealer(window.elements.dragger, {
						steps: getters.notesCount,
						speed: 0.3,
						loose: true,
						callback: function (x, y) {
							let index = this.getStep()[0] - 1;
							if (isNaN(index)) index = 0;
							commit('setCurrentNote', state.notes[index].id);
						}
					});
					window.elements.dd.setStep(stepIndex);
					commit('updateDraggerWidth');
				} else {
					commit('toggleStatus', {'isEmpty': true});
				}
			});
		},
		initEvents ({state, getters, commit, dispatch}) {
			window.addEventListener('resize', function (event) {
				if (window.elements.dd) {
					window.elements.dd.reflow();
				}
				commit('updateDraggerWidth');
			});

			document.addEventListener('mousewheel', function (event) {
				if (!state.status.isEmpty && !state.status.isContent) {
					let index = getters.noteIndex(state.status.current);
					if (event.deltaY < 0) {
						// Scroll up = previous slide
						window.elements.dd.setStep(index);
					} else {
						// Scroll down = next slide
						window.elements.dd.setStep(index + 2);
					}
				}
			});

			document.addEventListener('keydown', function (event) {
				if (!state.status.isEmpty) {
					let keyCode = event.keyCode || event.which;
					let currentSlide = window.elements.slides[getters.noteIndex(state.status.current)];
					if (state.status.isContent && !state.status.isEditing) {
						switch (keyCode) {
							case 38: // Up arrow key
								// Toggle content only if content is scrolled to topmost
								if (currentSlide.scrollTop === 0) {
									dispatch('toggleNote');
								}
								break;
						}
					} else {
						let index = getters.noteIndex(state.status.current);
						switch (keyCode) {
							case 40: // Down arrow key
								// Toggle content only if it's fullscreen
								if (state.status.isFullscreen) {
									dispatch('toggleNote');
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
				}
			});
		},
		draggerClickHandler ({dispatch}) {
			dispatch('toggleScreen');
		},
		slideClickHandler ({state, getters, dispatch}, noteID) {
			if (!state.status.isFullscreen && !state.status.isAnimating && !window.elements.dd.activity) {
				if (noteID === state.status.current) {
					dispatch('toggleScreen');
				} else {
					let index = getters.noteIndex(noteID);
					window.elements.dd.setStep(index + 1);
				}
			}
		},
		noteToggleHandler ({dispatch}) {
			dispatch('toggleNote');
		},
		noteAddHandler ({state, getters, commit, dispatch}) {
			let status = {
				'isLoading': true,
				'isNewNote': true
			};
			commit('toggleStatus', status);

			// TODO temporary note ID generator
			let newID = state.user.id + '_note_' + (getters.notesCount + 1);
			let note = {
				id: newID,
				title: '',
				content: '<p><br></p>'
			};
			commit('addNote', note);
			dispatch('initElements', getters.notesCount);
			// TODO callback
			setTimeout(function () {
				dispatch('toggleNote');
				dispatch('noteEditHandler', note.id);
				commit('toggleStatus', {'isLoading': false});
			}, 1000);
		},
		noteEditHandler ({commit}, noteID) {
			commit('toggleStatus', {'isEditing': true});
			Vue.nextTick(function () {
				window.elements.editor = new Quill('#content-' + noteID, {
					theme: 'snow',
					placeholder: 'Note Content',
					modules: {
						toolbar: toolbarOptions
					}
				});
			});
		},
		noteDeleteHandler ({getters, commit, dispatch}, noteID) {
			commit('toggleStatus', {'isLoading': true});
			dispatch('toggleNote');

			let index = getters.noteIndex(noteID);
			let stepIndex = index;
			if (index <= 0) {
				// If the first note is deleted
				stepIndex = 1;
			} else if (index >= getters.notesCount - 1) {
				// If the last note is deleted
				stepIndex = index;
			} else {
				stepIndex = index + 1;
			}

			commit('deleteNote', noteID);
			dispatch('initElements', stepIndex);
			// TODO temporary
			setTimeout(function () {
				commit('toggleStatus', {'isLoading': false});
			}, 1000);
		},
		noteSaveHandler ({state, getters, commit}, note) {
			commit('toggleStatus', {'isLoading': true});
			// If there are changes, save
			// Else, cancel
			let index = getters.noteIndex(note.id);
			if (note.title !== state.notes[index].title ||
				note.content !== state.notes[index].content) {
				note.timestamp = moment().valueOf();
				commit('saveNote', setNote(note));
			}
			// TODO temporary
			setTimeout(function () {
				let status = {
					'isEditing': false,
					'isLoading': false
				};
				commit('toggleStatus', status);
			}, 1000);
		},
		noteCancelHandler ({state, getters, commit, dispatch}, note) {
			// If there are changes, ask for confirmation
			// Else, cancel
			let index = getters.noteIndex(note.id);
			let response = true;
			if (note.title !== state.notes[index].title ||
				note.content !== state.notes[index].content) {
				note.timestamp = moment().valueOf();
				response = confirm('Are you sure you want to discard changes?');
			}
			if (response) {
				commit('toggleStatus', {'isEditing': false});
				if (state.status.isNewNote) {
					commit('toggleStatus', {'isNewNote': false});
					dispatch('noteDeleteHandler', note.id);
				}
			}
		},
		/**
		 * Function to toggle between fullscreen and minimized slideshow
		 */
		toggleScreen ({state, commit, dispatch}) {
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

			let onEndTransitionFn = function (event) {
				if (support.transitions) {
					if (event.propertyName.indexOf('transform') === -1 || event.target !== window.elements.dragger) return;
					this.removeEventListener(transEndEventName, onEndTransitionFn);
				}
				dispatch('toggleScreenEnd');
			};

			if (support.transitions) {
				window.elements.dragger.addEventListener(transEndEventName, onEndTransitionFn);
			} else {
				onEndTransitionFn();
			}
		},
		toggleScreenEnd ({state, commit}) {
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
			Vue.nextTick().then(function () {
				// Reinstatiate the dragger with the "reflow" method
				window.elements.dd.reflow();
				commit('updateDraggerWidth');
			});
		},
		/**
		 * Function to show/hide slide content
		 */
		toggleNote ({state, commit, dispatch}) {
			if (state.status.isAnimating) return false;

			// Callback
			// state.options.ontoggleNote();

			let slide = document.querySelector('#slide-' + state.status.current);
			slide.scrollTop = 0;

			let status = {
				'isAnimating': true
			};
			if (state.status.isContent) {
				window.elements.dd.bindEventListeners();
				status['slideIsShow'] = false;
				status['containerIsFixed'] = false;
			} else {
				window.elements.dd.unbindEventListeners();
				status['appIsSwitchShow'] = true;
				status['slideIsShow'] = true;
			}
			commit('toggleStatus', status);

			let onEndTransitionFn = function (event) {
				if (support.transitions) {
					if (event.propertyName.indexOf('transform') === -1 || event.target !== window.elements.slideshow) return;
					this.removeEventListener(transEndEventName, onEndTransitionFn);
				}
				dispatch('toggleNoteEnd');
			};

			if (support.transitions) {
				window.elements.slideshow.addEventListener(transEndEventName, onEndTransitionFn);
			} else {
				onEndTransitionFn();
			}
		},
		toggleNoteEnd ({state, commit}) {
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
			// state.options.ontoggleNoteComplete();
		}
	}
});
