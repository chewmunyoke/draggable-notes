export default {
	setUser (state, user) {
		for (let key in user) {
			state.user[key] = user[key];
		}
		state.text.appMessage = `Welcome, ${user.name}`;
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
};
