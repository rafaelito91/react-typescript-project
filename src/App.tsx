import React, { useState } from 'react';
import { render } from 'react-dom';
import { SUGGESTIONS } from './countries';
import './style.css';
import { Tag, WithContext as ReactTags } from 'react-tag-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

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
  let processed = tagText.replaceAll(/(\{|\}|\(|\)|\[|\])/g, '')
  const indexOfNumericEmphasis = processed.indexOf(':')
  if (indexOfNumericEmphasis !== -1) {
    processed = processed.slice(0, indexOfNumericEmphasis)
  }
  return processed
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

  const [showInput, setShowInput] = useState<boolean>(false);

  const [showButtons, setShowButtons] = useState<boolean>(true);

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
    const cleanTags = tags.map(tag => removeEmphasisFromTag(tag))
    localStorage.setItem(STORAGE_TAGS, JSON.stringify(cleanTags));
    localStorage.setItem(STORAGE_HISTORY_TAGS, JSON.stringify([...getStorageItem(STORAGE_HISTORY_TAGS), ...cleanTags]))
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

  const revertShowInput = () => {
    setShowInput(!showInput)
  }

  const importTags = () => {
    const inputElement: HTMLInputElement | undefined = document.querySelector('.hiddenInput') as HTMLInputElement
    if (inputElement !== undefined) {
      const value = inputElement.value
      if (value.length > 0) {
        const newTags = value.split(',').filter(tagText => tagText && tagText.length > 0).map(tag => {
          const rawValue = removeEmphasis(tag.trim())
          const newTag = {
            id: rawValue,
            text:rawValue
          }
          return newTag
        })
        setTags(newTags)
      }
    }
    revertShowInput()
  }

  return (
    <div className="app">
      <h1> Prompt Tags Manager </h1>
      {showInput && (
      <div className='hiddenDiv'>
        <input className='hiddenInput'></input>
        <button className='standardButton' onClick={importTags}>Import</button>
      </div>
      )}
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
        {showButtons && (
        <div>
          <div className="system-buttons-container">
            <button className="standardButton" onClick={revertShowInput}>
              {showInput ? 'Hide Import' : 'Show Import'}
            </button>
            <button className="standardButton" onClick={setNovelAi}>Novel Ai</button>
            <button className="standardButton" onClick={setStableDiffusion}>Stable diffusion</button>
          </div>
          <div className="buttons-container">
            <button className="standardButton" onClick={focusInput}>Focus input</button>
            <button className="clearButton" onClick={clearStorage}>Reset prompt</button>
            <button className="copyButton" onClick={copyToClipboard}>Copy prompt to clipboard</button>
          </div>
        </div>)
        }
        <button className='buttonsToggle' onClick={() => {setShowButtons(!showButtons)}}><FontAwesomeIcon icon={faEye} /></button>
      </div>
    </div>
  );
};

render(<App />, document.getElementById('root'));
