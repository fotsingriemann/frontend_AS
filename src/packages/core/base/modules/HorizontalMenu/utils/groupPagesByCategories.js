import pagesConfig from 'config/pagesConfig'

export default function(features) {
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
