const transEndEventNames = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'msTransition': 'MSTransitionEnd',
		'transition': 'transitionend'
	},
	transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
	support = {transitions : Modernizr.csstransitions};

const toolbarOptions = [
	//[{ 'font': [] }, { 'size': [] }],
	['bold', 'italic', 'underline', 'strike'],
	[{ 'script': 'sub'}, { 'script': 'super' }],
	//[{ 'color': [] }, { 'background': [] }],
	[{ 'list': 'ordered'}, { 'list': 'bullet' }],
	['blockquote', 'code-block', 'link'],
	['clean']
];

const state = {
	// App initial state
	status: {
		current: 'x',
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
		id: 0,
		name: "Test User",
		username: "test",
		password: "test"
	},
	notes: []
};

const STORAGE_KEY = 'draggable-notes';
