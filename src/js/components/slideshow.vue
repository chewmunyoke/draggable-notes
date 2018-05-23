<template>
	<transition name="v-display">
		<div class="slideshow"
			:class="slideshowClass"
			v-show="status.isDisplayed">
			<div class="dragdealer dragger"
				:class="draggerClass"
				:style="draggerStyle">
				<transition name="v-overlay">
					<div class="empty"
						v-if="status.isEmpty">
						{{ text.emptyMessage }}
					</div>
				</transition>
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
								<span class="title">{{ note.title }}</span>
								<span class="subtitle">Last Updated: </span>
								<span class="timestamp" :title="note.datestamp">{{ note.lastUpdated }}</span>
							</div>
							<div class="title-editor"
								v-if="note.id == status.current && status.isEditing">
								<textarea :id="'title-' + note.id"
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
						<div class="content-button-container"
							:style="containerStyle(note.id)">
							<div class="content-switch-wrapper">
								<div class="button-wrapper content-switch-wrapper">
									<button class="button content-switch"
										@click="noteToggleHandler">
									</button>
								</div>
								<div class="button-wrapper content-edit-wrapper"
									v-if="note.id == status.current && status.appIsShowContent && !status.isEditing">
									<button class="button content-edit"
										@click="noteEditHandler(note.id)">
									</button>&nbsp;
									<button class="button content-delete"
										@click="noteDeleteHandler(note.id)">
									</button>
								</div>
								<div class="button-wrapper content-save-wrapper"
									v-if="note.id == status.current && status.appIsShowContent && status.isEditing">
									<button class="button content-save"
										@click="noteSaveHandler(note.id)">
									</button>&nbsp;
									<button class="button content-cancel"
										@click="noteCancelHandler">
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
				'noteEditHandler',
				'noteCancelHandler'
			]),
			noteDeleteHandler: function(noteID) {
				if (confirm('Are you sure you want to delete this note?')) {
					this.$store.dispatch('noteDeleteHandler', noteID);
				}
			},
			noteSaveHandler: function(noteID) {
				// TODO validation
				let newTitle = document.querySelector('#title-' + noteID).value;
				let newContent = window.elements.editor.container.querySelector('.ql-editor').innerHTML;
				let note = {
					id: noteID,
					title: newTitle,
					content: newContent
				};
				this.$store.dispatch('noteSaveHandler', note);
			}
		}
	};
</script>
