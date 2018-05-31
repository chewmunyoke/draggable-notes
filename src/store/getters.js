export const notesCount = state => {
	return state.notes.length;
};

export const noteIndex = state => noteID => {
	return state.notes.findIndex(note => note.id === noteID);
};

export const zAxis = state => {
	return state.status.isFullscreen ?
		(state.options.perspective - (state.options.perspective / state.options.slideshowRatio)) :
		(state.options.perspective - (state.options.perspective * state.options.slideshowRatio));
};

export const slideIntialWidth = (state, getters) => {
	return (state.options.slideWidthPct / getters.notesCount) + '%';
};

export const slideInitialMargin = (state, getters) => {
	return '0 ' + (((state.options.draggerWidthPct - state.options.slideWidthPct) / 2) / getters.notesCount) + '%';
};

export const slideContentWidth = (state, getters) => {
	return 'calc(' + (state.options.draggerWidthPct / getters.notesCount) + '% - ' + state.options.slideContentMargin + 'px';
};

export const slideLeftValue = state => {
	return (state.status.draggerWidth * 0.14) + 'px';
};

export const draggerToggledWidth = state => {
	return state.options.slideshowRatio * state.options.draggerWidthPct + '%';
};

export const draggerToggledHeight = state => {
	return state.options.slideshowRatio * state.options.draggerHeightPct + '%';
};

export const handleWidth = (state, getters) => {
	return getters.notesCount * state.options.draggerWidthPct + '%';
};

export const draggerButtonClass = state => {
	return {
		'view-max': state.status.draggerButtonIsToggled
	};
};

export const slideshowClass = state => {
	return {
		'switch-max': state.status.appIsSwitchMax,
		'switch-min': state.status.appIsSwitchMin,
		'switch-show': state.status.appIsSwitchShow,
		'show-content': state.status.slideIsShow
	};
};

export const draggerClass = state => {
	return {
		'dragger-large': !state.status.draggerIsToggled,
		'dragger-small': state.status.draggerIsToggled
	};
};

export const draggerStyle = (state, getters) => {
	return {
		// TODO prefix
		'width': state.status.draggerIsToggled ? getters.draggerToggledWidth : null,
		'height': state.status.draggerIsToggled ? getters.draggerToggledHeight : null,
		'transform': state.status.draggerIsTransforming ?
			`perspective(${state.options.perspective}px) translate3d(0, 0, ${getters.zAxis}px)` :
			`translate3d(0, 0, 0)`
	};
};

export const handleStyle = (state, getters) => {
	return {
		'width': getters.handleWidth
	};
};

export const slideClass = (state, getters) => noteID => {
	let index = getters.noteIndex(noteID);
	let currentIndex = getters.noteIndex(state.status.current);
	return {
		'current': index === currentIndex,
		'previous': index === currentIndex - 1,
		'next': index === currentIndex + 1,
		'show': index === currentIndex && state.status.slideIsShow
	};
};

export const slideStyle = (state, getters) => noteID => {
	let index = getters.noteIndex(noteID);
	let currentIndex = getters.noteIndex(state.status.current);
	let left = null;
	if (!state.status.appIsSwitchMin && !state.status.appIsSwitchShow && !state.status.draggerIsToggled) {
		if (index === currentIndex - 1) {
			left = getters.slideLeftValue;
		} else if (index === currentIndex + 1) {
			left = `-${getters.slideLeftValue}`;
		}
	}
	return {
		'left': left,
		'width': noteID === state.status.current && state.status.slideIsShow ? getters.slideContentWidth : getters.slideIntialWidth,
		'margin': noteID === state.status.current && state.status.slideIsShow ? null : getters.slideInitialMargin,
		'transform-style': state.status.preserve3dSlides ? 'preserve-3d' : null
	};
};

export const containerStyle = (state, getters) => noteID => {
	return {
		'position': noteID === state.status.current && state.status.containerIsFixed ? 'fixed' : null,
		'width': noteID === state.status.current && state.status.containerIsFixed ? getters.slideContentWidth : null
	};
};
