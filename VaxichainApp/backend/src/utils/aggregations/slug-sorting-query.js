export const slugSortingQuery = (wouldBeSlug) => [
  {
    $match: {
      slug: {
        $regex: `^${wouldBeSlug}([\-0-9]*)?$`,
      },
    },
  },
  {
    $sort: {
      slug: -1,
    },
  },
]
