<template>
	<transition name="v-display">
		<div class="slideshow"
			:class="slideshowClass"
			v-show="status.isDisplayed">
			<div class="dragdealer dragger"
				:class="draggerClass"
				:style="draggerStyle">
				<div class="handle"
					:style="handleStyle">
					<div class="slide"
						:class="slideClass(note.id)"
						:style="slideStyle(note.id)"
						@click="slideClickHandler(note.id)"
						v-for="(note, index) in notes"
						:id="'slide-' + note.id"
						:key="index">
						<div class="note">
							<div class="title-container"
								v-if="!(note.id == status.current && status.isEditing)">
								<span class="title">
									{{ note.title || "Untitled" }}
								</span>
								<span class="subtitle">
									Last Updated: 
								</span>
								<span class="timestamp" 
									:title="note.datestamp">
									{{ note.lastUpdated }}
								</span>
							</div>
							<div class="title-editor"
								v-if="note.id == status.current && status.isEditing">
								<textarea placeholder="Note Title"
									:id="'title-' + note.id"
									v-html="note.title">
								</textarea>
							</div>
							<div class="content"
								v-if="!(note.id == status.current && status.isEditing)"
								v-html="note.content">
							</div>
							<div class="content-editor"
								v-if="note.id == status.current && status.isEditing">
								<div :id="'content-' + note.id"
									v-html="note.content">
								</div>
							</div>
						</div>
						<div class="note-button-container"
							:style="containerStyle(note.id)">
							<div class="note-toggle-wrapper">
								<div class="button-wrapper note-toggle-wrapper"
									v-if="!status.isEditing">
									<button class="button note-toggle"
										@click="noteToggleHandler">
									</button>
								</div>
								<div class="button-wrapper note-edit-wrapper"
									v-if="note.id == status.current && status.slideIsShow && !status.isEditing">
									<button title="Edit"
										class="button note-edit"
										@click="noteEditHandler(note.id)">
									</button>&nbsp;
									<button title="Delete"
										class="button note-delete"
										@click="noteDeleteHandler(note.id)">
									</button>
								</div>
								<div class="button-wrapper note-save-wrapper"
									v-if="note.id == status.current && status.slideIsShow && status.isEditing">
									<button title="Save"
										class="button note-save"
										@click="noteSaveHandler(note.id)">
									</button>&nbsp;
									<button title="Cancel"
										class="button note-cancel"
										@click="noteCancelHandler(note.id)">
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
	import { mapState, mapGetters, mapActions } from 'vuex';

	export default {
		computed: {
			...mapState([
				'status',
				'text',
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
				'noteToggleHandler',
				'noteAddHandler',
				'noteEditHandler'
			]),
			noteDeleteHandler: function(noteID) {
				if (confirm('Are you sure you want to delete this note?')) {
					this.$store.dispatch('noteDeleteHandler', noteID);
				}
			},
			noteSaveHandler: function(noteID) {
				let newTitle = document.querySelector('#title-' + noteID).value;
				let newContent = window.elements.editor.container.querySelector('.ql-editor').innerHTML;
				let note = {
					id: noteID,
					title: newTitle,
					content: newContent
				};
				this.$store.dispatch('noteSaveHandler', note);
			},
			noteCancelHandler: function(noteID) {
				let newTitle = document.querySelector('#title-' + noteID).value;
				let newContent = window.elements.editor.container.querySelector('.ql-editor').innerHTML;
				let note = {
					id: noteID,
					title: newTitle,
					content: newContent
				};
				this.$store.dispatch('noteCancelHandler', note);
			}
		}
	};
</script>
