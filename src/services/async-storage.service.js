export const storageService = {
  query,
  get,
  post,
  put,
  remove,
  postMany,
  getItem,
  putItem,
}

function query(entityType) {
  var entities = JSON.parse(localStorage.getItem(entityType)) || []
  return Promise.resolve(entities)
}

function get(entityType, entityId) {
  return query(entityType).then((entities) =>
    entities.find((entity) => entity._id === entityId)
  )
}

//find an item from the tree and return it
async function getItem(entityType, entityId) {
  let items = await query(entityType)

  var foundItem = null
  function checkItem(item) {
    if (item._id === entityId) foundItem = item
  }
  _traverse({key: 'all', children: [...items]}, checkItem)
  return foundItem
}

async function getItemByKey(entityType, entityKey) {
  let items = await query(entityType)

  var foundItem = null
  function checkItem(item) {
    if (item.key === entityKey) foundItem = item
  }
  _traverse({key: 'all', children: [...items]}, checkItem)
  return foundItem
}

function _traverse(node, visitFn) {
  visitFn(node)
  node.children.forEach((childNode) => {
    _traverse(childNode, visitFn)
  })
}

function post(entityType, newEntity) {
  newEntity._id = _makeId()
  return query(entityType).then((entities) => {
    entities.push(newEntity)
    _save(entityType, entities)
    return newEntity
  })
}
function postMany(entityType, newEntities) {
  return query(entityType).then((entities) => {
    newEntities = newEntities.map((entity) => ({...entity, _id: _makeId()}))
    entities.push(...newEntities)
    _save(entityType, entities)
    return entities
  })
}

//need to change it to recursive found in the tree
function put(entityType, updatedEntity) {
  return query(entityType).then((entities) => {
    const idx = entities.findIndex((entity) => entity._id === updatedEntity._id)
    entities.splice(idx, 1, updatedEntity)
    _save(entityType, entities)
    return updatedEntity
  })
}

async function putItem(entityType, updatedEntity, comment) {
  let items = await query(entityType)

  async function checkItem(item) {
    //find the parent
    if (item._id === updatedEntity._id) {
      // item = updatedEntity
      item.children.push(comment)
      // const parent = await getItemByKey(entityType, updatedEntity.parentKey)
      // const idx = parent.children.findIndex(
      //   (item) => item._id === updatedEntity._id
      // )
      // parent.children.splice(idx, 1, updatedEntity)
    }
  }
  _traverse({key: 'all', children: [...items]}, checkItem)
  _save(entityType, items)

  return updatedEntity
}

function remove(entityType, entityId) {
  return query(entityType).then((entities) => {
    const idx = entities.findIndex((entity) => entity._id === entityId)
    entities.splice(idx, 1)
    _save(entityType, entities)
    return entities
  })
}

function _save(entityType, entities) {
  localStorage.setItem(entityType, JSON.stringify(entities))
}

function _makeId(length = 5) {
  var text = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
