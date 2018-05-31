import Vue from 'vue';
import moment from 'moment';
import Quill from 'quill';
import Dragdealer from '../utils/dragdealer';
import * as constants from '../utils/constants';

export const login = ({state, commit}, credentials) => {
	console.log('login');
};

export const fetchData = ({commit}, credentials) => {
	return new Promise((resolve, reject) => {
		/*
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let newData = JSON.parse(this.responseText);
				setTimeout(() => {
					commit('setUser', newData.user);
					if (newData.notes.length > 0) {
						newData.notes.forEach(note => {
							commit('addNote', setNote(note));
						});
						commit('setCurrentNote', newData.notes[0].id);
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
		*/
		let data = JSON.parse(localStorage.getItem(constants.STORAGE_KEY));
		if (data) {
			commit('setUser', data.user);
			if (data.notes.length > 0) {
				data.notes.forEach(note => {
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
	});
};

export const initElements = ({state, getters, commit}, stepIndex) => {
	Vue.nextTick().then(() => {
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
};

export const initEvents = ({state, getters, commit, dispatch}) => {
	window.addEventListener('resize', event => {
		window.elements.dd.reflow();
		commit('updateDraggerWidth');
	});

	document.addEventListener('mousewheel', event => {
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

	document.addEventListener('keydown', event => {
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
};

export const draggerClickHandler = ({dispatch}) => {
	dispatch('toggleScreen');
};

export const slideClickHandler = ({state, getters, dispatch}, noteID) => {
	if (!state.status.isFullscreen && !state.status.isAnimating && !window.elements.dd.activity) {
		if (noteID === state.status.current) {
			dispatch('toggleScreen');
		} else {
			let index = getters.noteIndex(noteID);
			window.elements.dd.setStep(index + 1);
		}
	}
};

export const noteToggleHandler = ({dispatch}) => {
	dispatch('toggleNote');
};

export const noteAddHandler = ({state, getters, commit, dispatch}) => {
	let status = {
		'isLoading': true,
		'isNewNote': true
	};
	commit('toggleStatus', status);

	// TODO temporary note ID generator
	let newID = `${state.user.id}_note_${getters.notesCount + 1}`;
	let note = {
		id: newID,
		title: '',
		content: '<p><br></p>'
	};
	commit('addNote', note);
	dispatch('initElements', getters.notesCount);
	// TODO callback
	setTimeout(() => {
		dispatch('toggleNote');
		dispatch('noteEditHandler', note.id);
		commit('toggleStatus', {'isLoading': false});
	}, 1000);
};

export const noteEditHandler = ({commit}, noteID) => {
	commit('toggleStatus', {'isEditing': true});
	Vue.nextTick(() => {
		window.elements.editor = new Quill(`#content-${noteID}`, {
			theme: 'snow',
			placeholder: 'Note Content',
			modules: {
				toolbar: constants.toolbarOptions
			}
		});
	});
};

export const noteDeleteHandler = ({getters, commit, dispatch}, noteID) => {
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
	setTimeout(() => {
		commit('toggleStatus', {'isLoading': false});
	}, 1000);
};

export const noteSaveHandler = ({state, getters, commit}, note) => {
	// If there are changes, save
	// Else, cancel
	let index = getters.noteIndex(note.id);
	if (note.title !== state.notes[index].title ||
		note.content !== state.notes[index].content) {
		note.timestamp = moment().valueOf();
		commit('toggleStatus', {'isLoading': true});
		commit('saveNote', setNote(note));
	}
	// TODO temporary
	setTimeout(() => {
		let status = {
			'isEditing': false,
			'isLoading': false
		};
		commit('toggleStatus', status);
	}, 1000);
};

export const noteCancelHandler = ({state, getters, commit, dispatch}, note) => {
	// If there are changes, ask for confirmation
	// Else, cancel
	let index = getters.noteIndex(note.id);
	let response = true;
	if (note.title !== state.notes[index].title ||
		note.content !== state.notes[index].content) {
		note.timestamp = moment().valueOf();
		response = confirm(`Are you sure you want to discard changes?`);
	}
	if (response) {
		commit('toggleStatus', {'isEditing': false});
		if (state.status.isNewNote) {
			commit('toggleStatus', {'isNewNote': false});
			dispatch('noteDeleteHandler', note.id);
		}
	}
};

/**
 * Function to toggle between fullscreen and minimized slideshow
 */
export const toggleScreen = ({state, commit, dispatch}) => {
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
		if (constants.support.transitions) {
			if (event.propertyName.indexOf('transform') === -1 || event.target !== window.elements.dragger) return;
			this.removeEventListener(constants.transEndEventName, onEndTransitionFn);
		}
		dispatch('toggleScreenEnd');
	};

	if (constants.support.transitions) {
		window.elements.dragger.addEventListener(constants.transEndEventName, onEndTransitionFn);
	} else {
		onEndTransitionFn();
	}
};

export const toggleScreenEnd = ({state, commit}) => {
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
	Vue.nextTick().then(() => {
		// Reinstatiate the dragger with the "reflow" method
		window.elements.dd.reflow();
		commit('updateDraggerWidth');
	});
};

/**
 * Function to show/hide slide content
 */
export const toggleNote = ({state, commit, dispatch}) => {
	if (state.status.isAnimating) return false;

	// Callback
	// state.options.ontoggleNote();

	let slide = document.querySelector(`#slide-${state.status.current}`);
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
		if (constants.support.transitions) {
			if (event.propertyName.indexOf('transform') === -1 || event.target !== window.elements.slideshow) return;
			this.removeEventListener(constants.transEndEventName, onEndTransitionFn);
		}
		dispatch('toggleNoteEnd');
	};

	if (constants.support.transitions) {
		window.elements.slideshow.addEventListener(constants.transEndEventName, onEndTransitionFn);
	} else {
		onEndTransitionFn();
	}
};

export const toggleNoteEnd = ({state, commit}) => {
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
};

function setNote (note) {
	note.datestamp = moment(note.timestamp).format('LLLL');
	note.lastUpdated = moment(note.timestamp).fromNow();
	return note;
}
