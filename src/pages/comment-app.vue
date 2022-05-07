<template>
  <h1>Hi vue</h1>
  <h2>Add new Comment</h2>
  <input v-model="commentText" type="text" />
  <button @click="addToRoot">Add</button>
  <comment-list @added="loadComments" :comments="commentsToShow" />
  <pre v-if="comments">{{ comments }}</pre>
</template>

<script>
  import {itemService} from '../services/item.service'
  import commentList from '@/cmps/comment-list.vue'

  export default {
    name: 'comments',
    components: {
      commentList,
    },
    data() {
      return {
        comments: null,
        commentText: '',
      }
    },
    async created() {
      this.loadComments()
    },
    methods: {
      addComment({key, text}) {
        itemService.addComment(key, text)
      },
      async loadComments() {
        this.comments = await itemService.query()
      },
      async addToRoot() {
        const savedItem = await itemService.addCommentToRoot(this.commentText)
        this.loadComments()
        this.commentText = ''
      },
    },
    computed: {
      commentsToShow() {
        return this.comments
      },
    },
    unmounted() {},
  }
</script>
