import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { SUGGESTIONS } from './countries';
import './style.css';
import { Tag, WithContext as ReactTags } from 'react-tag-input';

const STORAGE_HISTORY_TAGS = 'historyTags';
const STORAGE_TAGS = 'tags';

const getStorageItem = (storageItem: string) => {
  const storageValue = localStorage.getItem(storageItem)
  return storageValue ? JSON.parse(storageValue ?? '[]'): []
}

const suggestions = [...SUGGESTIONS.map(suggestion => {
  return {
    id: suggestion,
    text: suggestion
  };
}), ...getStorageItem(STORAGE_HISTORY_TAGS)];

const KeyCodes = {
  comma: 188,
  enter: 13
};

type System = 'novelai' | 'stable-diffusion'

type EmphasisCharacter = '{' | '}' | '(' | ')'
type EmphasisDelimiter = {
  opener: EmphasisCharacter,
  closer: EmphasisCharacter
}

const emphasisMap: Record<System, EmphasisDelimiter> = {
  novelai: {
    opener: '{',
    closer: '}'
  },
  "stable-diffusion": {
    opener: '(',
    closer: ')'
  }
}

const delimiters = [KeyCodes.comma, KeyCodes.enter];

const getEmphasisScore = (tag: Tag) => {
  const tagText = tag.text
  let intensity = 0
  for (const char of tagText) {
    if (['{', '('].includes(char)) {
      intensity++
    } else {
      break
    }
  }
  return intensity
}

const removeEmphasis = (tagText: string) => {
  return tagText.replaceAll(/(\{|\}|\(|\))/g, '')
}

const removeEmphasisFromTag = (tag: Tag) => {
  const newTag = {
    id: removeEmphasis(tag.id),
    text: removeEmphasis(tag.text)
  }
  return newTag
}

export const App = () => {
  const [system, setSystem] = useState<System>('stable-diffusion')

  const [tags, setTags] = useState<Tag[]>(
    getStorageItem(STORAGE_TAGS)
  );

  const handleDelete = (i: number) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag: Tag) => {
    setTags([...tags, tag]);
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };

  const addEmphasis = (tag: Tag): Tag => {
    const {opener, closer} = emphasisMap[system]
    if (getEmphasisScore(tag) >= 6) {
      return removeEmphasisFromTag(tag)
    }  else {
      return {
        id: `${opener}${tag.id}${closer}`,
        text: `${opener}${tag.text}${closer}`,
      }
    }
  }

  const handleTagClick = (index: number) => {
    // TODO: Improvament - Understand why it's counting for 2 clicks
    console.log('Click event!')
    const tag = { ...tags[index] }
    const newTags = [...tags]
    newTags[index] = addEmphasis(tag) 
    setTags(newTags)
  };

  const copyToClipboard = () => {
    const tagsText = tags.map(tag => tag.text).join(', ');
    localStorage.setItem(STORAGE_TAGS, JSON.stringify(tags));
    localStorage.setItem(STORAGE_HISTORY_TAGS, JSON.stringify([...getStorageItem(STORAGE_HISTORY_TAGS), ...tags]))
    navigator.clipboard.writeText(tagsText);
  };

  const clearStorage = () => {
    localStorage.setItem(STORAGE_TAGS, JSON.stringify([]));
    setTags([])
  };

  const focusInput = () => {
    document.querySelector('input')?.focus()
  };

  const resetTagsEmphasis = () => {
    const newTags = tags.map(tag => removeEmphasisFromTag(tag))
    setTags(newTags)
  }

  const setNovelAi = () => {
    resetTagsEmphasis()
    setSystem('novelai')
  }

  const setStableDiffusion = () => {
    resetTagsEmphasis()
    setSystem('stable-diffusion')
  }

  return (
    <div className="app">
      <h1> React Tags Example </h1>
      
      <div>
        <ReactTags
          tags={tags}
          suggestions={suggestions}
          delimiters={delimiters}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          handleDrag={handleDrag}
          handleTagClick={handleTagClick}
          inputFieldPosition="top"
          autofocus={true}
          autocomplete
        />
        <div className="system-buttons-container">
          <button className="standardButton" onClick={setNovelAi}>Novel Ai</button>
          <button className="standardButton" onClick={setStableDiffusion}>Stable diffusion</button>
        </div>
        <div className="buttons-container">
          <button className="standardButton" onClick={focusInput}>Focus input</button>
          <button className="clearButton" onClick={clearStorage}>Reset prompt</button>
          <button className="copyButton" onClick={copyToClipboard}>Copy prompt to clipboard</button>
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById('root'));
