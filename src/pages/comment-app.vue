<template>
  <h1>Hi vue</h1>
  <h2>Add new Comment</h2>
  <input type="text" />
  <button>Add</button>
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
      }
    },
    async created() {
      // this.comments = //itemService.getInitialItemTree().children
      // this.comments = await itemService.query()
      this.loadComments()
    },
    methods: {
      addComment({key, text}) {
        console.log('here')
        console.log(key, text)
        itemService.addComment(key, text)
      },
      async loadComments() {
        console.log('loading')
        this.comments = await itemService.query()
      },
    },
    computed: {
      commentsToShow() {
        console.log('running')
        return this.comments
      },
    },
    unmounted() {},
  }

  function getItemHtml(item) {
    return `<li>
                <label>
                    ${item.key}
                    <span>subCount: ${item.children.length}</span>
                    <input type="checkbox" data-key="${item.key}" ${
      item.picked ? 'checked' : ''
    } onchange="app.updateSelection(this)" />
                    <input type="text" data-key="${item.key}" ${
      item.picked ? 'disabled' : ''
    } onchange="app.updateInput(this)" />
                </label>
                ${`<ul>
                    ${item.children.map(getItemHtml).join('')}
                </ul>`}
            </li>`
  }

  function renderItemsTree() {
    var strHTML = ''
    function accumulateItemsHTML(item) {
      strHTML += getItemHtml(item)
    }

    itemService.traverseItems(accumulateItemsHTML)
    const el = document.querySelector('.checkbox-container ul')
    el.innerHTML = strHTML
    // el.innerHTML = itemHTMLMap[Object.keys(itemHTMLMap)[0]]

    function setIndeterminateItems(item) {
      if (item.picked === undefined) {
        el.querySelector(`input[data-key=${item.key}]`).indeterminate = true
      }
    }
    itemService.traverseItems(setIndeterminateItems)
  }
</script>

<style></style>
