import { Tag } from "react-tag-input"
import { removeEmphasis } from "./App"

export type TagType = 'picture-quality' | 'character-quality' | 'background-quality' | 'effect' | 'positioning' | 'pose' | 'style'

export const tagTypeMapping: Record<TagType, [string, string[]]> = {
 pose: ['blue', ['sitting', 'looking at viewer']],
 positioning: ['green', []],
 effect: ['pink', ['semi-silhouette light']],
 style: ['purple', ['redshift style', 'analog style', 'mdjrny-v4 style', 'dreamlikeart style', 'studio ghibli style', 'copeseethemald style']],
 "background-quality": ['orange', ["detailed background"]],
 "character-quality": ['yellow', ["subsurface skin scattering","shiny skin","beautiful detailed eyes","realistic", "photorealistic", "well-lit face","smooth","glowing face","highly detailed facial features", "detailed facial features"]],
 "picture-quality": ['red', ["RAW", "analog", "Nikon Z 85mm", "award winning glamour photograph","sharp focus", "digital render", "professional", "4k", "artstation", "artgerm", "octane render", "highres","ultra realistic", "photorealism", "photography", "8k", "uhd", "photography","octane render", "photorealistic", "realistic", "post-processing", "max detail", "roughness", "real life", "octane render","dust particle paint explosion","high detail", "sharp focus", "aesthetic", "extremely detailed", "stamp", "masterpiece", "highly detailed", "intricate details", "best quality"]],
}

export const tagTypes:TagType[] = Object.keys(tagTypeMapping) as TagType[]

const orderTagTypeMapping: Record<number, TagType> = (() => {
 const result: Record<number, TagType> = {}
 for (let i=0; i < tagTypes.length; i++) {
  const tag = tagTypes[i]
  result[i] = tag
 }
 return result
})()

const getMappingByIndex = (index: number) => {
 return tagTypeMapping[orderTagTypeMapping[index]]
}

const findTagIndex = (tag: Tag) => {
 const rawTagText = removeEmphasis(tag.text)
 for (let i = 0 ; i < tagTypes.length; i++) {
  const mapping: [string, string[]] = getMappingByIndex(i)
  const mappedTags = mapping[1]
  if (mappedTags.includes(rawTagText)) {
   return i
  }
 }
 return -1
}

export const SUGGESTIONS: string[] = (() => {
 const result = new Set<string>()
 for (const key of Object.keys(tagTypeMapping) as TagType[]) {
  const tags = tagTypeMapping[key][1]
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
  const index = findTagIndex(tag)
  const tagCopy = { id: tag.id, text: tag.text }

  if (index === -1) {
   noResults.push(tagCopy)
  } else {
   results[index].push(tagCopy)
  }
 }

 return [...results.reduce((prev, cur) => prev.concat(cur) , noResults)]
}

const findTagMapping = (tag: Tag): [string, string[]] | undefined => {
 const index = findTagIndex(tag)
 if (index === -1) {
  return undefined
 }
 return getMappingByIndex(index)
}

export const findTagColor = (tag: Tag) => {
 const mapping = findTagMapping(tag)
 if (!mapping) {
  return undefined
 }
 return mapping[0]
}