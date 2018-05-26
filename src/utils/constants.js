const transEndEventNames = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'msTransition': 'MSTransitionEnd',
		'transition': 'transitionend'
	};
export const transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];
export const support = {transitions : Modernizr.csstransitions};

export const toolbarOptions = [
	//[{ 'font': [] }, { 'size': [] }],
	['bold', 'italic', 'underline', 'strike'],
	[{ 'script': 'sub'}, { 'script': 'super' }],
	//[{ 'color': [] }, { 'background': [] }],
	[{ 'list': 'ordered'}, { 'list': 'bullet' }],
	['blockquote', 'code-block', 'link'],
	['clean']
];

export const STORAGE_KEY = 'draggable-notes';