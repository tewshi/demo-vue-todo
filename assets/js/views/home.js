/** @format */

const HomeView = {
  name: 'Home',
  props: {
    user: {
      type: Object,
      required: true,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      todo: { text: '' },
      todos: [],
      message: '',
      loading: false,
    }
  },
  beforeRouteEnter(to, from, next) {
    if (!localStorage.getItem('user')) {
      return next({ name: 'login' })
    }

    return next()
  },
  mounted() {
    const todosRef = localStorage.getItem('todos')
    if (todosRef) {
      this.todos = JSON.parse(todosRef)
    }
  },
  methods: {
    renderTodo(todo) {
      const item = this.todos.find((t) => t.id === todo.id)

      if (item && todo.status === 'deleted') {
        this.todos = this.todos.filter((item) => item.status !== 'deleted')

        localStorage.setItem('todos', JSON.stringify(this.todos))
        return
      }

      todo.checked = todo.status === 'done'

      if (!item) {
        this.todos.push(item)
      }

      localStorage.setItem('todos', JSON.stringify(this.todos))
    },

    async addTodo(text) {
      this.loading = true
      this.message = ''
      const fd = new FormData()
      fd.append('text', text)
      fd.append('user', this.user.id)
      try {
        const response = await fetch('/api.php?action=add-todo', { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        const data = await response.json()
        if (data.status !== 'success') {
          this.message = data.message
        } else {
          this.todos.push(data.data)
          this.renderTodo(data.data)
        }

        this.loading = false
      } catch (error) {
        this.loading = false
        console.log(error)
      }
    },

    async toggleDone(id) {
      this.loading = true
      this.message = ''
      const index = this.todos.findIndex((item) => item.id === Number(id))
      const item = this.todos[index]
      let status = 'done'
      if (item.status === 'done') {
        status = 'pending'
      }

      const fd = new FormData()
      fd.append('todo', item.id)
      fd.append('user', this.user.id)
      fd.append('status', status)
      try {
        const response = await fetch('/api.php?action=change-todo-status', {
          method: 'POST',
          body: fd,
          headers: { Accept: 'application/json' },
        })
        const data = await response.json()
        if (data.status !== 'success') {
          this.message = data.message
        } else {
          this.todos[index] = data.data
          this.renderTodo(this.todos[index])
        }
        this.loading = false
      } catch (error) {
        this.loading = false
        console.log(error)
      }
    },

    async deleteTodo(id) {
      const index = this.todos.findIndex((item) => item.id === Number(id))
      const item = this.todos[index]

      const fd = new FormData()
      fd.append('todo', item.id)
      fd.append('user', this.user.id)
      try {
        const response = await fetch('/api.php?action=delete-todo', { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        const data = await response.json()
        if (data.status !== 'success') {
          this.message = data.message
        } else {
          this.todos[index].status = 'deleted'
          this.renderTodo(this.todos[index])
        }
      } catch (error) {
        console.log(error)
      }
    },

    async submit() {
      const text = `${this.todo.text}`
      if (text) {
        await this.addTodo(text)
        this.todo.text = ''
        this.$refs.input.focus()
      }
    },
  },
  template: `
  <div class="col-lg-5">
    <div class="card bg-secondary shadow border-0">
      <div class="card-header bg-white">
        <div class="empty-state text-muted text-center">
          <h2 id="empty-state" :class="{'empty-state__title': true, 'd-none': todos.length === 0}">
            Add your first todo
          </h2>
          <p class="empty-state__description">
            What do you want to get done today?
          </p>
        </div>
        <ul class="list-group js-todo-list">
          <li v-for="todo in todos" :key="todo.id" :class="{'list-group-item d-flex justify-content-between align-items-center': true, 'done': todo.checked}">
            <div class="custom-control custom-control-alternative custom-checkbox w-100" @click.stop.prevent="() => toggleDone(todo.id)">
              <input class="custom-control-input js-tick" :id="'todo-check-' + todo.id" type="checkbox" v-model="todo.checked" />
              <label class="custom-control-label w-100" :for="'todo-check-' + todo.id"><span>{{todo.text}}</span></label>
            </div>
            <button class="delete-todo js-delete-todo text-red" @click.stop.prevent="() => deleteTodo(todo.id)">
              <i class="fa fa-trash fa-2x"></i>
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body px-lg-5 py-lg-5">
        <form role="form" class="js-form" @submit.prevent="submit">
          <div class="form-group mb-3">
            <div class="input-group input-group-alternative">
              <div class="input-group-prepend">
                <span class="input-group-text"
                  ><i class="ni ni-fat-add"></i
                ></span>
              </div>
              <input
                v-model.trim="todo.text"
                ref="input"
                class="form-control js-todo-input"
                placeholder="e.g Build a web app"
                autofocus
                type="text"
                id="js-input"
                autocomplete="username"
                :disabled="loading"
                required
              />
            </div>
            <p id="error-message">{{message}}</p>
          </div>

          <div class="text-center">
            <button
              id="js-submit"
              type="submit"
              :disabled="loading"
              class="btn btn-primary btn-block mt-4"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>`,
}

// const list = document.querySelector('.js-todo-list')
// list.addEventListener('click', (event) => {
//   if (event.target.classList.contains('js-tick')) {
//     const itemKey = event.target.parentElement.dataset.key
//     return toggleDone(itemKey)
//   }

//   if (event.target.classList.contains('js-delete-todo')) {
//     const itemKey = event.target.parentElement.dataset.key
//     deleteTodo(itemKey)
//   }
// })

// document.addEventListener('DOMContentLoaded', () => {
//     todos.forEach((t) => {
//       renderTodo(t)
//     })

// })
