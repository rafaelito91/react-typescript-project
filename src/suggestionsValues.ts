import { Tag } from "react-tag-input"
import { removeEmphasis } from "./App"

export type TagType = 'picture-quality' | 'character-quality' | 'background-quality' | 'effect' | 'positioning' | 'pose'

export const tagTypeMapping: Record<TagType, string[]> = {
 pose: [],
 positioning: [],
 effect: [],
 "character-quality": ["subsurface skin scattering","shiny skin","beautiful detailed eyes","realistic", "photorealistic", "well-lit face","smooth","glowing face","highly detailed facial features",],
 "background-quality": ["detailed background"],
 "picture-quality": ["RAW", "analog", "Nikon Z 85mm", "award winning glamour photograph","sharp focus", "digital render", "professional", "4k", "artstation", "artgerm", "octane render", "highres","ultra realistic", "photorealism", "photography", "8k", "uhd", "photography","octane render", "photorealistic", "realistic", "post-processing", "max detail", "roughness", "real life", "octane render","dust particle paint explosion","high detail", "sharp focus", "aesthetic", "extremely detailed", "stamp", "masterpiece"],
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

export const rearrangeTagListBasedOnMapping = (tagList: Tag[]) => {
 const tagTypes = Object.keys(tagTypeMapping) as TagType[]

 const results: Tag[][] = new Array<Tag[]>(tagTypes.length)
 for (let i = 0; i < results.length; i++) {
  results[i] = new Array<Tag>()
 }

 const noResults: Tag[] = []

 for (const tag of tagList) {
  const rawTag = removeEmphasis(tag.text)
  for (let i = 0; i < tagTypes.length + 1; i++) {
   if (i === tagTypes.length) {
    noResults.push({
     id: tag.id,
     text: tag.text
    })
    break
   }
   const type = tagTypes[i]
   const mappedTagsForType = tagTypeMapping[type]
   if (mappedTagsForType.includes(rawTag)) {
    results[i].push({
     id: tag.id,
     text: tag.text
    })
    break
   }
   
  }
 }

 return [...results.reduce((prev, cur) => prev.concat(cur) , noResults)]
}