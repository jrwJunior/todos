import './css/style.scss';
import Router from './Router';

const router = new Router([
  { path: '/',name: 'Root' },
  { path: '/active',name: 'Active' },
  { path: '/completed',name: 'Completed' }
]);

class TodoApp {
  constructor(selector) {
    if (!selector) {
      throw new Error('Something wrong with your selector 😭');
    }

    this.attachEvent([selector, 'todo-list', 'routers']);
    this.uploadDataFromStorage(JSON.parse(localStorage.getItem('todo')));
  }

  render(container, data, id) {
    let isDataID = false;

    if (!data || !data.length) {
      if (container.hasChildNodes()) {
        document.getElementById(id).remove();
        container.parentElement.style.display = 'none';
      }
      return;
    }

    for (let item of data) {
      if (document.getElementById(item.id)) {
        continue;
      }

      if (item.id === id) {
        isDataID = true;
      }

      container.append(document.createElement('li'));
      this.createItem(container.children, item);
    }

    if (!isDataID && id) {
      document.getElementById(id).remove();
    }

    if (container.hasChildNodes()) {
      container.parentElement.style = '';
    }

    this.showingСompletedTasks(data);
  }

  uploadDataFromStorage(storage) {
    const content = document.getElementById('content');

    if (storage && storage.length) {
      this.getDataFromRouting(window.location.pathname, storage);
      this.showingСompletedTasks(storage);
    } else {
      content.style.display = 'none';
    }

    this.deletedCompleted(storage);
  }

  updateDataToStorage(value) {
    const storageData = JSON.parse(localStorage.getItem("todo"));
    let error = false;

    if (storageData) {
      storageData.forEach(item => {
        if (item.todo === value) {
          error = true;
          this.error(document.querySelector('.header'), error, 'already added!');
        }
      });
    }

    if (error) {
      return;
    }

    if (localStorage.getItem("todo") === null) {
      localStorage.setItem("todo", JSON.stringify([].concat({id: Math.random().toString(25).substr(2),todo: value, complete: false})));
    } else {
      storageData.push({id: Math.random().toString(25).substr(2), todo: value, complete: false});
      localStorage.setItem("todo", JSON.stringify(storageData));
    }

    this.render(document.getElementById('todo-list'), JSON.parse(localStorage.getItem("todo")), null);
  }

  error(parent, state, errorText) {
    const errorElement = document.createElement('span');

    if (state) {
      parent.append(errorElement);
      errorElement.innerText = errorText;
    }

    setTimeout(() => errorElement.remove(), 3000);
  }

  getDataFromRouting(router, data) {
    const parent = document.getElementById('todo-list');
    const storage = router === '/' ? data : [];

    data.filter(item => {
      switch(router) {
        case '/active':
          if (!item.complete) {
            storage.push(item);
          }
          break;
        case '/completed':
          if (item.complete) {
            storage.push(item);
          }
          break;
      }
    });

    for (let i = 0; i < parent.children.length; i+=1) {

      if (!(storage[i]) || parent.children[i].getAttribute('id') !== storage[i].id) {
        parent.children[i].remove();
        i-=1;
      }
    }

    this.render(document.getElementById('todo-list'), storage, null);
    this.updateCompleted(storage);
  }

  complited(evt) {
    const target = evt.target;
    const storageData = JSON.parse(localStorage.getItem("todo"));
    
    if (target.tagName === 'INPUT') {
      let parent = target;

      while (!parent.hasAttribute('id')) {
        parent = parent.parentElement;
      }

      storageData.forEach(item => {
        if (item.id === parent.id) {
          item.complete = target.checked;
        }
      });

      if (target.checked) {
        parent.classList.add('completed');
      } else {
        parent.classList.remove('completed');
      }
    }

    localStorage.setItem("todo", JSON.stringify(storageData));
    this.getDataFromRouting(window.location.pathname, JSON.parse(localStorage.getItem("todo")));
    this.deletedCompleted(storageData);
  }

  updateCompleted(data) {
    const list = document.querySelectorAll('.view input');

    for (let i = 0; i < list.length; i+=1) {
      data.forEach(item => {
        const parent = list[i].closest('li');

        if (parent.id === item.id) {
          list[i].checked = item.complete;
        }

        if (list[i].checked) {
          parent.classList.add('completed');
        }
      });
    }
  }

  showingСompletedTasks(data) {
    const element = document.querySelector('.footer span');
    let count = 0;
    let isChecked = true;

    if (!data.length) {
      element.innerText = `${count} items left`;
    }

    data.forEach(item => {
      if (!item.complete) {
        element.innerText = `${count+=1} items left`;
        isChecked = false;
      }

      if (isChecked) {
        element.innerText = `${count} items left`;
      }
    });
  }

  editingTodo(parent, data) {
    const editInput = document.createElement('input');
    const attrs = {
      type: 'text',
      class: 'input-edit',
      value: data.map(item => {
        if (parent.getAttribute('id') === item.id) {
          return item.todo;
        }
      }).join('')
    }

    function handler(evt) {
      if (evt.key !== 'Enter' && evt.type !== 'blur') {
        return;
      }

      data.forEach(item => {
        if (item.id === parent.getAttribute('id')) {
          Object.assign(item, {todo: editInput.value});
        }
      });

      localStorage.setItem('todo', JSON.stringify(data));
      parent.querySelector('.view label').innerText = editInput.value;

      if (parent.classList.contains('editing')) {
        parent.classList.remove('editing');
        editInput.remove();
      }
    }

    if (!parent.classList.contains('editing')) {
      parent.classList.add('editing');
    }

    for (let key in attrs) {
      editInput.setAttribute(key, attrs[key]);
    }

    parent.append(editInput);
    editInput.focus();
    editInput.selectionStart = editInput.value.length;

    editInput.addEventListener('blur', handler, true);
    editInput.addEventListener('keydown', handler, true);
  }

  routingNavigation(evt) {
    const target = evt.target;

    if (target.tagName === 'BUTTON') {
      this.getDataFromRouting(window.location.pathname, JSON.parse(localStorage.getItem("todo")));
    }
  }

  deleteNodeDOM(evt) {
    const target = evt.target;

    if (target.classList.contains('deleted-item') && target.tagName === 'BUTTON') {
      let parent = target;

      while (parent.tagName !== 'LI') {
        parent = parent.parentElement;
      }

      this.deleteDataFromStorage(parent.getAttribute('id'));
    }

    if (target.classList.contains('edit-item') && target.tagName === 'BUTTON') {
      this.editingTodo(target.closest('li'), JSON.parse(localStorage.getItem('todo')));
    }
  }

  deleteDataFromStorage(id) {
    const storageData = JSON.parse(localStorage.getItem("todo"));
    
    storageData.forEach((item, idx) => {
      if (id === item.id) {
        storageData.splice(idx, 1);
      }
    });

      localStorage.setItem("todo", JSON.stringify(storageData));
      this.render(document.getElementById('todo-list'), storageData, id);
      this.showingСompletedTasks(storageData);
  }

  deletedCompleted(storageData) {
    const clearButton = document.querySelector('.deleted-completed');
    const content = document.getElementById('content');
    let isChecked = false;

    if (!storageData || !storageData.length) {
      return;
    }

    storageData.forEach((item, idx) => {
      if (item.complete) {
        clearButton.style.visibility = 'visible';
        isChecked = true;
      }

      if (!isChecked) {
        clearButton.style.visibility = 'hidden';
      }
    });

    clearButton.addEventListener('click', () => {
      const data = JSON.parse(localStorage.getItem('todo'));

      data.forEach((item, idx) => {
        if (item.id === document.getElementById(item.id).getAttribute('id') && item.complete) {
          data.splice(idx, 1);

          localStorage.setItem('todo', JSON.stringify(data));
          this.render(document.getElementById('todo-list'), data, item.id);
          clearButton.style.visibility = 'hidden';
        }

        if (!data.length) {
          content.style.display = 'none';
          clearButton.style.visibility = 'hidden';
        }
      });
    }, true);
  }

  add(event) {
    if (event.target.value.length && event.key === 'Enter') {
      this.updateDataToStorage(event.target.value);
      event.target.value = '';
    }
  }

  checkForEmptiness(event) {
    if (event.target.value.length && !(/^\s+$/.test(event.target.value))) {
      event.target.setAttribute('value', event.target.value.trim());
    } else {
      event.target.value = '';
    }
  }

  createItem(child, item) {
    for (let i = 0; i < child.length; i+=1) {
      const nodeItem = child[i];

      if (!nodeItem.getAttribute('id')) {
        nodeItem.setAttribute('id', item.id);
      }

      if (nodeItem.getAttribute('id') === item.id) {
        nodeItem.innerHTML = `
        <div class='view'>
          <input type='checkbox' class='todo-check'>
          <label id="todo-label">${item.todo}</label>
          <button type='button' class='edit-item' id='edit'></button>
          <button type='button' class='deleted-item' id='deleted'></button>
        </div>`;
      }
    }
  }

  attachEvent(collection) {
    for (let i = 0; i < collection.length; i+=1) {
      const selector = collection[i];

      if (selector.nodeType === Node.ELEMENT_NODE && selector.getAttribute('id') === 'todo-input') {
        selector.addEventListener('input', this.checkForEmptiness.bind(this));
        selector.addEventListener('keydown', this.add.bind(this));
      } else {
        switch(selector) {
          case 'todo-list':
            document.getElementById(selector).addEventListener('click', this.deleteNodeDOM.bind(this));
            document.getElementById(selector).addEventListener('click', this.complited.bind(this));
            break;
          case 'routers':
            document.getElementById(selector).addEventListener('click', this.routingNavigation.bind(this));
            break;
        }
      }
    }
  }
}

new TodoApp(document.getElementById('todo-input'));