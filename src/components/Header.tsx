import React from 'react';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[]; // Array of Todo objects
  handleTickPressed: () => void; // Function to handle the "tick all" button
  query: string; // The current query string for the new todo
  handleQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Function to handle changes in the query input
  inputRef: React.RefObject<HTMLInputElement>; // Reference to the input field
  addTodo: (event: React.FormEvent) => void;
};

export const Header: React.FC<Props> = ({
  todos,
  handleTickPressed,
  query,
  handleQueryChange,
  inputRef,
  addTodo,
}) => {
  return (
    <header className="todoapp__header">
      <button
        type="button"
        className="todoapp__toggle-all active"
        data-cy="ToggleAllButton"
        onClick={handleTickPressed}
      />
      <form onSubmit={addTodo}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={query}
          onChange={handleQueryChange}
          ref={inputRef}
          autoFocus
          disabled={todos.some(todo => todo.isSubmitting)}
        />
      </form>
    </header>
  );
};
