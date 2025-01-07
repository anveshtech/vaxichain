export const generateUniqueSlug = async (existingSortedSimilarSlugs, wouldBeSlug) => {
  try {
    if (existingSortedSimilarSlugs.length === 0) {
      return `${wouldBeSlug}-1`
    }

    const slugNumber = existingSortedSimilarSlugs[0]?.slug?.split("-").at(-1)
    const uniqueSlug = isNaN(Number(slugNumber)) ? `${wouldBeSlug}-1` : `${wouldBeSlug}-${Number(slugNumber) + 1}`

    return uniqueSlug
  } catch (error) {
    throw new Error("error generating slug")
  }
}
