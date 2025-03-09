import React from 'react';
import { Todo } from '../types/Todo';
import { TodoStatus } from '../types/TodoStatus'; // Import the TodoStatus enum

type Props = {
  status: TodoStatus; // Use TodoStatus enum here
  handleStatusChange: (status: TodoStatus) => void;
  todos: Todo[];
  deleteThisTodo: (todoId: number) => void;
  handleCheckedChange: (todoId: number) => void;
  isChecked: boolean;
  notCompletedTodosLength: number;
};

export const TodoFilter: React.FC<Props> = ({
  todos,
  handleStatusChange,
  status,
  deleteThisTodo,
  notCompletedTodosLength,
}) => {
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    value: TodoStatus,
  ) => {
    e.preventDefault();
    handleStatusChange(value); // Pass the TodoStatus enum value
  };

  const isCompleted = todos.some(todo => todo.completed);

  const clearCompletedTodos = () => {
    todos
      .filter(todo => todo.completed) // Only completed todos
      .forEach(todo => deleteThisTodo(todo.id)); // Delete each completed todo
  };

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {notCompletedTodosLength} items left
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={`filter__link ${status === TodoStatus.All ? 'selected' : ''}`}
          data-cy="FilterLinkAll"
          onClick={e => handleClick(e, TodoStatus.All)}
        >
          All
        </a>

        <a
          href="#/active"
          className={`filter__link ${status === TodoStatus.Active ? 'selected' : ''}`}
          data-cy="FilterLinkActive"
          onClick={e => handleClick(e, TodoStatus.Active)}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={`filter__link ${status === TodoStatus.Completed ? 'selected' : ''}`}
          data-cy="FilterLinkCompleted"
          onClick={e => handleClick(e, TodoStatus.Completed)}
        >
          Completed
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        onClick={clearCompletedTodos}
        disabled={!isCompleted}
        style={{
          visibility: isCompleted ? 'visible' : 'hidden',
        }}
      >
        Clear completed
      </button>
    </footer>
  );
};
