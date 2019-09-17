<template>
  <div v-if="asyncDataStatus_ready" class="container">
    <div class="col-full push-top">
      <h1>
        Editing <i>{{ thread.title }}</i>
      </h1>

      <ThreadEditor
        :title="thread.title"
        :text="text"
        ref="editor"
        @save="save"
        @cancel="cancel"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import ThreadEditor from '@/components/ThreadEditor';
import asyncDataStatus from '@/mixins/asyncDataStatus';

export default {
  components: {
    ThreadEditor
  },
  mixins: [asyncDataStatus],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return { saved: false };
  },
  computed: {
    thread() {
      return this.$store.state.threads[this.id];
    },
    text() {
      const post = this.$store.state.posts[this.thread.firstPostId];
      return post ? post.text : null;
    },
    hasUnsavedChanges() {
      const hasChanged =
        (this.$refs.editor.form.title !== this.thread.title ||
          this.$refs.editor.form.text !== this.text) &&
        !this.saved;

      return hasChanged;
    }
  },
  methods: {
    ...mapActions(['updateThread', 'fetchThread', 'fetchPost']),

    save({ title, text }) {
      this.updateThread({
        id: this.id,
        title,
        text
      }).then(thread => {
        this.saved = true;
        this.$router.push({
          name: 'ViewThreadRead',
          params: { id: thread['.key'] }
        });
      });
    },

    cancel() {
      this.$router.push({
        name: 'ViewThreadRead',
        params: { id: this.id }
      });
    }
  },

  created() {
    this.fetchThread({ id: this.id })
      .then(thread => this.fetchPost({ id: thread.firstPostId }))
      .then(() => {
        this.asyncDataStatus_fetched();
      });
  },

  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Are you sure you want to leave? Unsaved changes will be lost'
      );
      if (confirmed) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  }
};
</script>

<style></style>
