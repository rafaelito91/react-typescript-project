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

const delimiters = [KeyCodes.comma, KeyCodes.enter];

export const App = () => {
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

  const handleTagClick = (index: number) => {
    console.log('The tag at index ' + index + ' was clicked');
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
        <div className="buttons-container">
        <button className="focusButton" onClick={focusInput}>Focus input</button>
          <button className="clearButton" onClick={clearStorage}>Reset clipboard</button>
          <button className="copyButton" onClick={copyToClipboard}>Copy tags to clipboard</button>
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById('root'));
