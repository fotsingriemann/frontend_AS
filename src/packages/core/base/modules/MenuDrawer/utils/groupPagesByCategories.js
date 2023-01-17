import pagesConfig from 'config/pagesConfig'

/**
 * @param {object[]} features The array of feature objects
 * @summary Groups the subset of pages(given by feature keys) by it's category
 */
function groupPagesByCategories(features) {
  return features.reduce((acc, cur) => {
    const { category, ...curPageConfig } = pagesConfig[cur.key]

    if (acc[category.key]) {
      acc[category.key].pages.push(curPageConfig)
    } else {
      acc[category.key] = {
        category,
        pages: [curPageConfig]
      }
    }

    return acc
  }, {})
}

export default groupPagesByCategories
