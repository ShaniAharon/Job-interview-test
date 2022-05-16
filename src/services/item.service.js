import { storageService } from './async-storage.service.js'
// import {utilService} from './util.service.js'

const KEY = 'commentDB'
var gItemsTree
  ; (() => {
    gItemsTree = getInitialItemTree()
    _toggleNodesParent()
    _createComments()
  })()

window.test = {
  getItems,
  traverseItems,
  update,
  getAsString,
  addItem,
  getLeafCount,
  getItem,
  _toggleNodesParent,
  getInitialItemTree,
  subCommentsDeepCount,
  nestedLoop,
  _traverseTest,
  goDeep,
}

export const itemService = {
  getItems,
  traverseItems,
  update,
  getAsString,
  addItem,
  getLeafCount,
  updateComment,
  addComment,
  subCommentsCount,
  getInitialItemTree,
  flatIt,
  query,
  getById,
  remove,
  save,
  goDeep,
  addCommentToRoot,
}

function getItems() {
  return gItemsTree
}

function getAsString() {
  _toggleNodesParent(false)
  const str = JSON.stringify(gItemsTree, null, 2)
  _toggleNodesParent()
  return str
}

function update(key, picked) {
  function setPickedStatus(item) {
    const pickedChildren = item.children.filter(
      (child) => child.picked !== false
    )
    const fullyPickedChildren = pickedChildren.filter((child) => child.picked)
    if (pickedChildren.length === 0) {
      item.picked = false
    } else if (fullyPickedChildren.length === item.children.length) {
      item.picked = true
    } else {
      delete item.picked
    }
  }

  let item = getItem(key)
  _traverse(item, (item) => (item.picked = picked))

  while (item.parent) {
    item = item.parent
    setPickedStatus(item)
  }
}

//find an item from the tree and return it
function getItem(key) {
  var foundItem = null
  function checkItem(item) {
    if (item.key === key) foundItem = item
  }
  _traverse(gItemsTree, checkItem)
  return foundItem
}

async function getItemTest(id) {
  const foundItem = await getById(id)
  return foundItem
}

//added or removed parent node prop to all the childs
function _toggleNodesParent(shouldSetParent = true) {
  //no need for all this stuff restore it to the original logic
  const withs = []
  function setParentPropToNode(parentNode) {
    if (!parentNode._id) parentNode._id = Math.random().toString().slice(2, 9)

    for (let i = 0; i < parentNode.children.length; i++) {
      const child = parentNode.children[i]
      if (!withs.includes(child.key)) {
        if (!parentNode._id) {
        }

        if (shouldSetParent) {
          child.parent = parentNode._id
          child.parentKey = parentNode.key
        } else delete child.parent
        withs.push(child.key)
      }
      setParentPropToNode(child)
    }
  }
  _traverse(gItemsTree, setParentPropToNode)
}

function traverseItems(visitFn) {
  return _traverse(gItemsTree, visitFn)
}

function _traverse(node, visitFn) {
  visitFn(node)
  node.children.forEach((childNode) => {
    _traverse(childNode, visitFn)
  })
}

function addItem(key, item) {
  function isKeyFound(node) {
    if (node.key === key) {
      node.children.push(item)
    }
  }
  _traverse(gItemsTree, isKeyFound)
}

function getLeafCount() {
  let c = 0
  let p = 0
  function count(node) {
    if (!node.children.length) {
      c++
      if (node.picked) p++
    }
  }
  _traverse(gItemsTree, count)
}

function updateComment(key, txt) {
  let item = getItem(key)
  item.commentText = txt
}

async function addComment(id, txt) {
  if (!txt) return // plaster try without it, because the recursion cmp preview fire 3 times
  let item = await getItemTest(id) //change ger item to work with local storage data
  const comment = {
    key: txt,
    picked: false,
    commentText: txt,
    children: [],
    _id: Math.random().toString().slice(2, 9),
  }
  item.children.push(comment)

  return save(item, comment) // it overwrite the rest of the tree fix it
}

async function addCommentToRoot(txt) {
  const comment = {
    key: txt,
    picked: false,
    commentText: txt,
    children: [],
  }

  return save(comment) // it overwrite the rest of the tree fix it
}

function simpleStringify(object) {
  var simpleObject = {}
  for (var prop in object) {
    if (!object.hasOwnProperty(prop)) {
      continue
    }
    if (typeof object[prop] == 'object') {
      continue
    }
    if (typeof object[prop] == 'function') {
      continue
    }
    simpleObject[prop] = object[prop]
  }
  return JSON.parse(JSON.stringify(simpleObject)) // returns cleaned up JSON
}

//count the number of direct childs, sub comments
function subCommentsCount(key) {
  let item = getItem(key)

  return item.children.length
}

//count the number of all the childs, sub comments
function subCommentsDeepCount(key) {
  let item = getItem(key)
  let count = 0
  function countChilds(node) {
    count += node.children.length
  }
  _traverse(item, countChilds)

  return count
}

//test flatten to array with objs
function flatIt() {
  const comments = []
  const gTree = getInitialItemTree()
  function flatChildren(node) {
    node._id = Math.random().toString().slice(2, 9)

    if (node.children.length) {
      comments.push(...flatten(node.children))
    }
  }
  _traverse(gTree, flatChildren)
  //
  return [...new Set(comments)]
}

function flatten(values) {
  return values.reduce(
    (acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val),
    []
  )
}

function nestedLoop(obj) {
  const res = []
  function recurse(obj, current) {
    for (const key in obj) {
      let value = obj[key]
      if (value != undefined) {
        if (Array.isArray(value)) {
          res.push(...value)
          recurse(value)
        }
      } else if (value && typeof value === 'object') {
        recurse(value, key)
      } else {
        // res[key] = value
        res.push(value)
      }
    }
  }
  recurse(obj)

  return res
}

// function goDeep(tree) {
//   const res = []
//   function inside(item) {
//     if (item.children.length) res.push(...item.children)
//     else res.push(item)
//   }
//   _traverseTest(tree, inside)
//
// }
//go into each node and flat all the children into one array
function goDeep() {
  const res = []
  const gTree = gItemsTree //getInitialItemTree()
  function inside(item) {
    item._id = Math.random().toString().slice(2, 9)
    if (item.children.length && !res.includes(item)) {
      res.push(...item.children)
    }
    // else {
    //   res.push(item)
    // }
  }
  _traverseTest(gTree, inside)

  return [...new Set(res)].slice(0, 2) //Plaster try without the slice , you got 4 items 2 vegpuki1 vegmuki1
}

function _traverseTest(node, visitFn) {
  visitFn(node)
  node.children.forEach((childNode) => {
    _traverse(childNode, visitFn)
  })
}

function getInitialItemTree() {
  // const comment = {
  //   parentCommentId: null,
  //   commentId: Math.random().toString().slice(2, 9),
  //   key: '',
  //   picked: false,
  //   commentText: '',
  //   children: [],
  // }
  const itemsTree = {
    key: 'all',
    picked: false,
    commentText: '',
    children: [
      {
        key: 'humor',
        picked: false,
        commentText: '',
        children: [
          {
            key: 'joke1',
            picked: false,
            commentText: '',
            children: [],
          },
          {
            key: 'joke2',
            picked: false,
            commentText: '',
            children: [],
          },
        ],
      },
      {
        key: 'veg',
        picked: false,
        commentText: '',
        children: [
          {
            key: 'veg1',
            picked: false,
            commentText: '',
            children: [
              {
                key: 'veg1-puk',
                picked: false,
                commentText: '',
                children: [],
              },
              {
                key: 'veg1-muk',
                picked: false,
                commentText: '',
                children: [],
              },
            ],
          },
          {
            key: 'veg2',
            picked: false,
            commentText: '',
            children: [],
          },
        ],
      },
    ],
  }
  return itemsTree
}

function _createComments() {
  var comments = JSON.parse(localStorage.getItem(KEY))
  if (!comments || !comments.length) {
    comments = goDeep() //flatIt()
    // _toggleNodesParent(false)
    localStorage.setItem(KEY, JSON.stringify(comments))
  }
  // return comments
}

function query() {
  return storageService.query(KEY)
}

function getById(id) {
  return storageService.getItem(KEY, id)
}

function remove(id) {
  return storageService.remove(KEY, id)
}

function save(item, comment) {
  const savedProject = item._id
    ? storageService.putItem(KEY, item, comment)
    : storageService.post(KEY, item)
  return savedProject
}

window.gItemsTree = gItemsTree

//test flatten to array wit objs
// function flatIt() {
//   const tree = {
//     key: 'all',
//     picked: false,
//     commentText: '',
//     children: [
//       {
//         key: 'humor',
//         picked: false,
//         commentText: '',
//         children: [
//           {
//             key: 'joke1',
//             picked: false,
//             commentText: '',
//             children: [],
//           },
//           {
//             key: 'joke2',
//             picked: false,
//             commentText: '',
//             children: [],
//           },
//         ],
//       },
//       {
//         key: 'veg',
//         picked: false,
//         commentText: '',
//         children: [
//           {
//             key: 'veg1',
//             picked: false,
//             commentText: '',
//             children: [
//               {
//                 key: 'veg1-puk',
//                 picked: false,
//                 commentText: '',
//                 children: [],
//               },
//               {
//                 key: 'veg1-muk',
//                 picked: false,
//                 commentText: '',
//                 children: [],
//               },
//             ],
//           },
//           {
//             key: 'veg2',
//             picked: false,
//             commentText: '',
//             children: [],
//           },
//         ],
//       },
//     ],
//   }
//   const arr = []
//   function flatChildren(node) {
//     if (node.children.length) arr.push(...flatten(node.children))
//   }

//   traverse(tree, flatChildren)
//
// }

// function traverse(node, visitFn) {
//   visitFn(node)
//   node.children.forEach((childNode) => {
//     traverse(childNode, visitFn)
//   })
// }

// function flatten(values) {
//   return values.reduce(
//     (acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val),
//     []
//   )
// }
