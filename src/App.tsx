/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useState, useEffect, useRef } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, deleteTodo, createTodo, USER_ID } from './api/todos';
import { TodoFilter } from './components/TodoFilter';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import classNames from 'classnames';

export const App: React.FC = React.memo(() => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  //const [appliedQuery, setAppliedQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  //const [tickPressed, setTickPressed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  function addTodo(event: React.FormEvent) {
    event.preventDefault();

    // Check if the query is empty
    if (!query.trim()) {
      setErrorMessage('Title should not be empty');
      setIsSubmitting(false); // Reset the submitting state when query is invalid

      return;
    }

    const tempTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title: query,
      completed: false,
    };

    // Start API request and manage submission state
    return createTodo(tempTodo)
      .then(TodoItem => {
        setTodos(currentTodos => [...currentTodos, TodoItem]);
        setQuery(''); // Clear input after adding the todo
        setErrorMessage(''); // Clear error message if successful
      })
      .catch(error => {
        setErrorMessage('Unable to add todo');
        setIsSubmitting(false); // Reset submission state on error
        throw error; // Propagate the error
      })
      .finally(() => {
        setIsSubmitting(false); // Reset submission state after the request is finished
      });
  }

  const handleStatusChange = (value: 'all' | 'active' | 'completed') => {
    setStatus(value);
  };

  // Filter todos based on status and query
  const filteredTodos = todos.filter(todo => {
    if (status === 'active') {
      return !todo.completed;
    }

    if (status === 'completed') {
      return todo.completed;
    }

    return true; // For 'all' status, return all todos
  });

  useEffect(() => {
  setLoading(true);
  setTimeout(() => {
    getTodos()
      .then(data => setTodos(data))
      .catch(error => {
        setErrorMessage('Unable to load todos');
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  }, 2000);
}, []);


  function deleteThisTodo(todoId: number) {
    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== todoId));

    return deleteTodo(todoId)
      .catch(error => {
        setTodos(todos);
        setErrorMessage('Unable to delete todo');
        throw error;
      })
      .finally(() => {
        inputRef.current?.focus();
      });
  }

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
            onClick={() => {
              const allCompleted = todos.every(todo => todo.completed); // Check if all todos are already completed

              setTodos(currentTodos =>
                currentTodos.map(todo => ({
                  ...todo,
                  completed: !allCompleted, // If all are completed, set them to not completed; otherwise, set them to completed
                })),
              );
            }}
          />
          <form onSubmit={addTodo}>
            <input
              data-cy="NewTodoField"
              type="text"
              className={classNames('todoapp__new-todo', {
                'is-loading': isSubmitting,
              })}
              placeholder="What needs to be done?"
              value={query}
              onChange={handleQueryChange}
              autoFocus
              ref={inputRef}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          <div>
            {!loading && (
              <TodoList
                todos={filteredTodos}
                setSelectedTodo={() => {}}
                selectedTodo={null}
                deleteThisTodo={deleteThisTodo}
                addTodo={addTodo}
              />
            )}
          </div>
        </section>
        {todos.length > 0 && (
          <div>
            <TodoFilter
              todos={filteredTodos}
              handleStatusChange={handleStatusChange}
              status={status}
              deleteThisTodo={deleteThisTodo}
            />
          </div>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          {
            hidden: !errorMessage,
          },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {errorMessage}
      </div>
    </div>
  );
});
App.displayName = 'App';

export default React.memo(App);
