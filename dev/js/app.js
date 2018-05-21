let mapState = Vuex.mapState;
let mapGetters = Vuex.mapGetters;
let mapActions = Vuex.mapActions;

let headerComponent = {
	template: '#header-component',
	computed: {
		...mapState([
			'appTitle',
			'appMessage'
		]),
		...mapGetters([
			'headerClass',
			'draggerButtonClass'
		])
	},
	methods: {
		...mapActions([
			'draggerClickHandler'
		])
	}
};

let app = new Vue({
	store,
	el: '#app',
	components: {
		'header-component': headerComponent
	},
	computed: {
		...mapState([
			'status',
			'elements',
			'user',
			'notes'
		]),
		...mapGetters([
			'slideshowClass',
			'draggerClass',
			'draggerStyle',
			'handleStyle',
			'slideClass',
			'slideStyle',
			'containerStyle'
		])
	},
	methods: {
		...mapActions([
			'slideClickHandler',
			'contentSwitchHandler',
			'contentEditHandler',
			'contentCancelHandler'
		]),
		contentDeleteHandler: function(noteID) {
			if (confirm('Are you sure you want to delete this note?')) {
				this.$store.dispatch('contentDeleteHandler', noteID);
			}
		},
		contentSaveHandler: function(noteID) {
			// TODO validation
			let newTitle = document.querySelector('#title-' + noteID).value;
			let newContent = window.elements.editor.container.querySelector('.ql-editor').innerHTML;
			let note = {
				id: noteID,
				title: newTitle,
				content: newContent
			};
			this.$store.dispatch('contentSaveHandler', note);
		}
	},
	mounted: function() {
		let app = this;
		let elements = {
			slideshow: this.$el.querySelector('.slideshow'),
			dragger: this.$el.querySelector('.dragger'),
			handle: this.$el.querySelector('.handle')
		};
		window.elements = elements;

		this.$store.dispatch('fetchData').then(function() {
			app.$store.dispatch('initElements', 1).then(function() {
				app.$store.dispatch('initEvents');
			});
		});
	}
});
