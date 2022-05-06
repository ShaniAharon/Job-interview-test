<template>
  <div :style="nodeMargin">
    <h1>
      Comment <span>{{ comment?.key }}</span>
    </h1>
    <!-- <pre>{{ comment }}</pre> -->
    <div class="actions">
      <button @click="toggleReply">Reply</button>
    </div>
    <section v-if="isReply" class="comment-submit">
      <input
        type="text"
        v-model="commentText"
        placeholder="Enter your comment"
      />
      <button @click="addComment(comment._id)">Add</button>
    </section>
    <div v-if="hasChildren">
      <!-- recursive component to display all childs -->
      <comment-preview
        v-for="child in comment.children"
        :key="child.key"
        :comment="child"
        :spacing="spacing + 30"
        @added="addComment(comment._id)"
      />
    </div>
  </div>
</template>

<script>
  import {itemService} from '../services/item.service'

  export default {
    name: 'commentPreview',
    props: {
      comment: {
        type: Object,
        required: true,
      },
      spacing: {
        type: Number,
        default: 0,
      },
    },
    emits: ['remove', 'added'],
    components: {},
    data() {
      return {
        isAdded: false,
        isReply: false,
        commentText: '',
      }
    },
    created() {},
    methods: {
      // removeComment() {
      //   this.$emit('remove', this.comment._id)
      // },
      toggleReply() {
        this.isReply = !this.isReply
      },
      async addComment(id) {
        // if (this.isAdded) return
        //try to fix because the recursion cmp preview fire 3 or more times if in the deep
        console.log(this.commentText)
        // if (!id || !this.commentText) return
        // const cap = {
        //   key,
        //   text: this.commentText,
        // }
        console.log('add', id)
        const savedItem = await itemService.addComment(id, this.commentText) // tryid to add directly because of prob with deep emits
        console.log('im here')
        this.$emit('added', savedItem)
        this.commentText = ''
        // this.isAdded = true
      },
    },
    computed: {
      nodeMargin() {
        return {
          'margin-left': `${this.spacing}px`,
        }
      },
      hasChildren() {
        const {children} = this.comment
        return children && children.length > 0
      },
    },
    unmounted() {},
  }
</script>
<style></style>
