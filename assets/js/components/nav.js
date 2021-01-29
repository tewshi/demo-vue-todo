/** @format */

const AppNav = {
  props: {
    user: {
      type: Object,
      required: true,
      default() {
        return {}
      },
    },
  },
  methods: {
    logout() {
      window.localStorage.clear()
      this.$router.push({ name: 'login' })
    },
  },
  template: `<nav
      id="navbar-main"
      class="navbar navbar-main navbar-expand-lg navbar-light py-2"
    >
      <div class="container">
        <a class="navbar-brand mr-auto" href="/">
          <img src="/assets/img/todo.png" />
        </a>
        <ul class="navbar-nav navbar-nav-hover align-items-lg-center">
          <li class="nav-item dropdown">
            <a
              class="nav-link py-2"
              data-toggle="dropdown"
              href="#"
              role="button"
            >
              <i class="ni ni-collection d-lg-none"></i>
              <span class="nav-link-inner--text"> {{user.name}} </span>
            </a>
            <div class="dropdown-menu">
              <a @click.prevent="logout" href="#" class="dropdown-item py-1">
                Logout
              </a>
            </div>
          </li>
        </ul>
      </div>
    </nav>`,
}
