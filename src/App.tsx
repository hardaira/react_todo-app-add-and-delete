/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useState, useEffect, useRef } from 'react';
import { UserWarning } from './UserWarning';
import {
  getTodos,
  deleteTodo,
  createTodo,
  updateTodo,
  USER_ID,
} from './api/todos';
import { TodoFilter } from './components/TodoFilter';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import classNames from 'classnames';

export const App: React.FC = React.memo(() => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickPressed, setTickPressed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);

    setIsChecked(false);
  };

  const handleTickPressed = () => {
    const allCompleted = !tickPressed; // If tickPressed is true, we want to set all to incomplete, otherwise set all to completed

    const updatedTodos = todos.map(todo => ({
      ...todo,
      completed: allCompleted, // Set all todos to completed or incomplete based on tickPressed
    }));

    // Update local state
    setTodos(updatedTodos);
    setTickPressed(allCompleted); // Toggle the tickPressed state to reflect the current status (completed or incomplete)

    // Update all todos on the server
    updatedTodos.forEach(updatedTodo => {
      updateTodo(updatedTodo).catch(error => {
        setErrorMessage('Unable to update todos');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        throw error; // Propagate error for debugging
      });
    });
  };

  const handleCheckedChange = (todoId: number) => {
    // Find the todo item by its ID
    const todo = todos.find(t => t.id === todoId);

    if (!todo) {
      return;
    }

    // Toggle the completed state locally first
    const updatedTodo = { ...todo, completed: !todo.completed };

    // Update the local state
    setTodos(currentTodos =>
      currentTodos.map(t => (t.id === todoId ? updatedTodo : t)),
    );

    // Update the todo on the server
    updateTodo(updatedTodo).catch(error => {
      setErrorMessage('Unable to update todo');
      setTimeout(() => {
        setErrorMessage(''); // Reset error message after 3 seconds
      }, 3000);
      throw error; // Propagate error for debugging
    });
  };

  function addTodo(event: React.FormEvent) {
    event.preventDefault();
    // Check if the query is empty
    if (!query.trim()) {
      setErrorMessage('Title should not be empty');
      setIsSubmitting(false); // Reset the submitting state when query is invalid
      setTimeout(() => {
        setErrorMessage(''); // Reset error message after 3 seconds
      }, 3000);

      return;
    }

    const tempTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title: query,
      completed: false,
    };

    setIsSubmitting(true);
    // Start API request and manage submission state
    return createTodo(tempTodo)
      .then(TodoItem => {
        setTodos(currentTodos => [...currentTodos, TodoItem]);
        setQuery(''); // Clear input after adding the todo
        setErrorMessage(''); // Clear error message if successful
      })
      .catch(error => {
        setErrorMessage('Unable to add todo');
        setTimeout(() => {
          setErrorMessage(''); // Reset error message after 3 seconds
        }, 3000);
        throw error; // Propagate the error
      })
      .finally(() => {
        setIsSubmitting(false);
        // Reset submission state after the request is finished
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
          setTimeout(() => {
            setErrorMessage('');
          }, 3000);
          throw error;
        })
        .finally(() => {
          setLoading(false);
        });
    }, 2000);
  }, []);

  const notCompletedTodos = todos.filter(todo => !todo.completed);
  const notCompletedTodosLength: number = notCompletedTodos.length;

  function deleteThisTodo(todoId: number) {
    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== todoId));

    return deleteTodo(todoId)
      .catch(error => {
        setTodos(todos);
        setErrorMessage('Unable to delete todo');
        setTimeout(() => {
          setErrorMessage(''); // Reset error message after 3 seconds
        }, 3000);
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
              disabled={isSubmitting}
              ref={inputRef}
              autoFocus
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
                isChecked={isChecked}
                isSubmitting={isSubmitting}
                handleCheckedChange={handleCheckedChange}
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
              notCompletedTodosLength={notCompletedTodosLength}
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
