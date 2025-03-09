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
import { TodoStatus } from './types/TodoStatus';
import { TodoList } from './components/TodoList';
import { Header } from './components/Header';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [tickPressed, setTickPressed] = useState(false);
  const [notCompletedTodosLength, setNotCompletedTodosLength] =
    useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<TodoStatus>(TodoStatus.All);

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
      updateTodo(updatedTodo).catch(() => {
        setErrorMessage('Unable to update todos');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        //throw error; // Propagate error for debugging
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
    updateTodo(updatedTodo).catch(() => {
      setErrorMessage('Unable to update a todo');
      setTimeout(() => {
        setErrorMessage(''); // Reset error message after 3 seconds
      }, 3000);
      //throw error; // Propagate error for debugging
    });
  };

  const handleTitleChange = (todoId: number, newTitle: string) => {
    // Find the todo item by its ID
    const todo = todos.find(t => t.id === todoId);

    if (!todo) {
      return; // If the todo doesn't exist, do nothing
    }

    // Only proceed if the title has actually changed
    if (todo.title === newTitle) {
      return; // No need to update if the title is the same
    }

    // Mark the todo as submitting to show a loader for the specific todo
    setTodos(prevTodos =>
      prevTodos.map(t => (t.id === todoId ? { ...t, isSubmitting: true } : t)),
    );

    // Perform the title change on the server
    return updateTodo({ ...todo, title: newTitle })
      .then(() => {
        // Update the local state with the new title after success
        setTodos(prevTodos =>
          prevTodos.map(t =>
            t.id === todoId
              ? { ...t, title: newTitle, isSubmitting: false }
              : t,
          ),
        );

        // Reset the editing state and selected todo id
        setIsEdited(false);
        setSelectedTodoId(null);
      })
      .catch(() => {
        // Handle error by resetting the submitting state and showing an error message
        setErrorMessage('Unable to update a todo');

        setTodos(prevTodos =>
          prevTodos.map(t =>
            t.id === todoId ? { ...t, isSubmitting: false } : t,
          ),
        );

        setTimeout(() => {
          setErrorMessage(''); // Reset error message after 3 seconds
        }, 3000);
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

    // Create temporary todo to display optimistically
    const tempTodo: Todo = {
      id: 0, // Temporarily set id to 0, it will be updated after successful API request
      userId: USER_ID,
      title: query.trim(),
      completed: false,
      isSubmitting: true,
    };

    // Optimistic update - Add tempTodo to the list immediately
    setTodos(currentTodos => [...currentTodos, tempTodo]);

    setErrorMessage(''); // Clear error message if successful

    // Start API request and manage submission state
    return createTodo(tempTodo)
      .then(newTodo => {
        // On success, replace the tempTodo with the actual todo from the API response
        setTodos(currentTodos =>
          currentTodos.map(todo => (todo.id === 0 ? newTodo : todo)),
        );
        setQuery(''); // Clear the input after a successful request
      })
      .catch(() => {
        // On error, remove the tempTodo or show an error state
        setTodos(currentTodos => currentTodos.filter(todo => todo.id !== 0));
        setErrorMessage('Unable to add a todo');
        setTimeout(() => {
          setErrorMessage(''); // Reset error message after 3 seconds
        }, 3000);
        //throw error;
      })
      .finally(() => {
        // Reset submitting state after the request is finished
        inputRef.current?.focus();
        setIsSubmitting(false);
      });
  }

  const handleStatusChange = (value: TodoStatus) => {
    setStatus(value);
  };

  // Filter todos based on status and query
  const filteredTodos = todos.filter(todo => {
    if (status === TodoStatus.Active) {
      return !todo.completed;
    }

    if (status === TodoStatus.Completed) {
      return todo.completed;
    }

    return true;
  });

  useEffect(() => {
    setLoading(true);
    getTodos()
      .then(data => setTodos(data))
      .catch(() => {
        setErrorMessage('Unable to load todos');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        //throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const notCompletedTodos = todos.filter(
      todo => !todo.completed && !todo.isSubmitting, // Exclude todos that are being submitted
    );

    setNotCompletedTodosLength(notCompletedTodos.length);
  }, [todos, isSubmitting]);

  function deleteThisTodo(todoId: number) {
    // Mark the todo as submitting to show a loader for the specific todo
    setTodos(currentTodos =>
      currentTodos.map(todo =>
        todo.id === todoId ? { ...todo, isSubmitting: true } : todo,
      ),
    );

    // Perform the deletion on the server
    return deleteTodo(todoId)
      .then(() => {
        // On success, remove the todo from the state
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        // On error, revert the todo state and show the error message
        setTodos(currentTodos =>
          currentTodos.map(todo =>
            todo.id === todoId ? { ...todo, isSubmitting: false } : todo,
          ),
        );
        setErrorMessage('Unable to delete a todo');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        //throw error; // Propagate error for debugging
      })
      .finally(() => {
        setIsSubmitting(false);
        inputRef.current?.focus();
      });
  }

  useEffect(() => {
    if (inputRef.current && !isSubmitting) {
      inputRef.current.focus();
    }
  }, [query, todos, isSubmitting]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          todos={filteredTodos}
          handleTickPressed={handleTickPressed}
          query={query}
          handleQueryChange={handleQueryChange}
          inputRef={inputRef}
          addTodo={addTodo}
        />

        <section className="todoapp__main" data-cy="TodoList">
          <div>
            {!loading && (
              <TodoList
                todos={filteredTodos}
                deleteThisTodo={deleteThisTodo}
                isChecked={isChecked}
                isSubmitting={false}
                isEdited={isEdited}
                setIsEdited={setIsEdited}
                handleCheckedChange={handleCheckedChange}
                handleTitleChange={handleTitleChange}
                selectedTodoId={selectedTodoId || 0}
                setSelectedTodoId={setSelectedTodoId}
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

      <ErrorNotification
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};

App.displayName = 'App';

export default React.memo(App);
