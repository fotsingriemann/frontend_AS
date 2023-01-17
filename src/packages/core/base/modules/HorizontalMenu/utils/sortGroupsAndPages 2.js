export default function(categories) {
  return Object.keys(categories)
    .map(x => ({
      category: categories[x].category,
      pages: categories[x].pages.sort(
        (page1, page2) => page1.order - page2.order
      )
    }))
    .sort(
      (category1, category2) =>
        category1.category.order - category2.category.order
    )
}
