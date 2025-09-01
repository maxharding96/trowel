/**
 * Compute the cosine similarity between two embedding vectors.
 * @param vecA - First embedding vector
 * @param vecB - Second embedding vector
 * @returns Cosine similarity value between -1 and 1
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of the same length')
  }

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    magnitudeA += vecA[i] ** 2
    magnitudeB += vecB[i] ** 2
  }

  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)

  if (magnitudeA === 0 || magnitudeB === 0) return 0 // Avoid division by zero

  return dotProduct / (magnitudeA * magnitudeB)
}
