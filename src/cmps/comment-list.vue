<template>
  <section>
    <comment-preview
      v-for="(comment, idx) in comments"
      :key="comment['key'] + Math.random()"
      :comment="comment"
      @added="addComment"
    />
    <!-- <div class="btns-container">
        <button @click="removeComment(comment._id)" class="btn btn-black">X</button>
        <button @click="editComment(comment._id)" class="btn btn-black">
          Edit
        </button>
      </div> -->
  </section>
</template>
<script>
  import commentPreview from './comment-preview.vue'

  export default {
    name: 'commentList',
    props: ['comments'],
    emits: ['removed', 'added'],
    components: {
      commentPreview,
    },
    data() {
      return {}
    },
    created() {},
    methods: {
      removeComment(projId) {
        this.$emit('removed', projId)
      },
      addComment(data) {
        console.log('hi')
        console.log(data)
        this.$emit('added', data)
      },
      // editComment(commentId) {
      //   this.$router.push(`/edit/${commentId}`);
      // },
      // showDetails(commentId) {
      //   this.$router.push(`/details/${commentId}`);
      // },
    },
    computed: {
      randSize() {
        return ['tall', 'wide', 'big'][Math.floor(Math.random() * 3)]
      },
    },
    unmounted() {},
  }
</script>
<style></style>
