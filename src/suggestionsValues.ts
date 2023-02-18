export type TagType = 'picture-quality' | 'character-quality' | 'background-quality' | 'effect' | 'positioning' | 'pose'

export const tagTypeMapping: Record<TagType, string[]> = {
 "picture-quality": ["RAW", "analog", "Nikon Z 85mm", "award winning glamour photograph","sharp focus", "digital render", "professional", "4k", "artstation", "artgerm", "octane render", "highres","ultra realistic", "photorealism", "photography", "8k", "uhd", "photography","octane render", "photorealistic", "realistic", "post-processing", "max detail", "roughness", "real life", "octane render","dust particle paint explosion","high detail", "sharp focus", "aesthetic", "extremely detailed", "stamp",],
 "character-quality": ["subsurface skin scattering","shiny skin","beautiful detailed eyes","realistic", "photorealistic", "well-lit face","smooth","glowing face","highly detailed facial features",],
 "background-quality": ["detailed background"],
 effect: [],
 positioning: [],
 pose: [],
}

export const SUGGESTIONS: string[] = (() => {
 const result = new Set<string>()
 for (const key of Object.keys(tagTypeMapping) as TagType[]) {
  const tags = tagTypeMapping[key]
  if (!tags) {
   continue
  }
  tags.forEach(element => {
   result.add(element)
  });
 }
 return Array.from(result)
})()