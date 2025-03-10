/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import React from 'react';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[];
  deleteThisTodo: (todoId: number) => void;
  isChecked: boolean;
  handleCheckedChange: (todoId: number) => void;
  isSubmitting: boolean;
  isEdited: boolean;
  selectedTodoId: number;
  setIsEdited: (isEdited: boolean) => void;
  setSelectedTodoId: (todoId: number) => void;
  handleTitleChange: (todoId: number, title: string) => void;
  submitChangedTitle: (
    e: React.FormEvent<HTMLFormElement>,
    todo: Todo,
  ) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  deleteThisTodo,
  handleCheckedChange,
  handleTitleChange,
  isEdited,
  selectedTodoId,
  setIsEdited,
  setSelectedTodoId,
  submitChangedTitle,
}: Props) => (
  <div>
    {todos.map(todo => (
      <div
        data-cy="Todo"
        className={todo.completed ? 'todo completed' : 'todo'}
        key={todo.id}
      >
        <label htmlFor={`todo-${todo.id}`} className="todo__status-label">
          <input
            id={`todo-${todo.id}`}
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            checked={todo.completed} // Make each checkbox reflect the completed state of the todo
            onChange={() => handleCheckedChange(todo.id)}
          />
        </label>

        {isEdited && todo.id === selectedTodoId ? (
          <form onSubmit={e => submitChangedTitle(e, todo)}>
            <input
              data-cy="TodoTitleField"
              type="text"
              className="todo__title-field"
              placeholder="Empty todo will be deleted"
              defaultValue={todo.title} // Display the current title in the input field
              onBlur={e => {
                e.preventDefault(); // Prevent any default behavior (if necessary)

                const newTitle = e.target.value.trim(); // Get the value directly from the input field

                if (newTitle !== todo.title) {
                  // Only update if the title has changed
                  handleTitleChange(todo.id, newTitle); // Call handleTitleChange with the new title
                }
              }}
              onKeyUp={e => {
                if (e.key === 'Escape') {
                  setIsEdited(false);
                }
              }}
              autoFocus
            />
          </form>
        ) : (
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => {
              setIsEdited(true);
              setSelectedTodoId(todo.id);
            }}
          >
            {todo.title}
          </span>
        )}

        {/* Remove button appears only on hover */}
        {!isEdited && (
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteThisTodo(todo.id)}
            disabled={todo.isSubmitting}
          >
            ×
          </button>
        )}

        {/* overlay will cover the todo while it is being deleted or updated */}

        <div
          data-cy="TodoLoader"
          className={classNames('modal overlay', {
            'is-active': todo.isSubmitting,
          })}
        >
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      </div>
    ))}
  </div>
);
