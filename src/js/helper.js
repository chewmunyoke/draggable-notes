import moment from 'moment';

export function setNote(note) {
	note.datestamp = moment(note.timestamp).format('LLLL');
	note.lastUpdated = moment(note.timestamp).fromNow();
	return note;
};
