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

export const state = {
	// App initial state
	status: {
		current: 0,
		isLoading: true,
		isDisplayed: false,
		isEmpty: false,
		isFullscreen: true,
		isContent: false,
		isNewNote: false,
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
		preserve3dSlides: false // fixes rendering problem in firefox
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
	text: {
		appName: 'Draggable Notes',
		appMessage: '',
		emptyMessage: 'You have no notes yet.',
		emptyButton: 'Create a new note!'
	},
	user: {
		user_id: 0,
		name: "Test User",
		username: "test",
		password: "test"
	},
	notes: []
};

export const STORAGE_KEY = 'draggable-notes';
//const JSON_DATA = 'https://jsonblob.com/api/jsonBlob/a0b77c20-4699-11e8-b581-9fcf0c943dad';
export const JSON_DATA = 'https://api.jsonbin.io/b/5adde191003aec63328dc0e1/6';
