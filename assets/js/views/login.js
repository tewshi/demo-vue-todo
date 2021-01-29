/** @format */

const LoginView = {
  name: 'Login',
  data() {
    return {
      user: { remember: true, username: '', password: '' },
      message: '',
      loading: false,
    }
  },
  mounted() {
    window.localStorage.clear()
  },
  methods: {
    login() {
      const { remember, username, password } = this.user
      const fd = new FormData()
      fd.append('remember', `${remember}`)
      fd.append('username', username)
      fd.append('password', password)
      this.loading = true
      fetch('/api.php?action=login', { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then((response) => response.json())
        .then((data) => {
          if (data.status !== 'success') {
            this.messages = data.message
            this.loading = false
          } else {
            localStorage.setItem('todos', JSON.stringify(data.data.todos))
            localStorage.setItem('user', JSON.stringify(data.data.user))
            this.$router.push({ name: 'home' })
          }
        })
        .catch((error) => {
          this.loading = false
          console.log(error)
        })
    },
  },
  template: `<div class="col-lg-5">
  <div class="card bg-secondary shadow border-0">
    <div class="card-header bg-white pb-5">
      <div class="text-muted text-center mb-3">Sign in with</div>
      <div class="btn-wrapper text-center">
        <a href="#" class="btn btn-neutral btn-icon">
          <span class="btn-inner--icon"
            ><img src="/assets/img/icons/common/github.svg"
          /></span>
          <span class="btn-inner--text">Github</span>
        </a>
        <a href="#" class="btn btn-neutral btn-icon">
          <span class="btn-inner--icon"
            ><img src="/assets/img/icons/common/google.svg"
          /></span>
          <span class="btn-inner--text">Google</span>
        </a>
      </div>
    </div>
    <div class="card-body px-lg-5 py-lg-5">
      <div class="text-center text-muted mb-4">
        <small>Or sign in with credentials</small>
      </div>
      <form role="form" class="js-login-form" @submit.prevent="login">
        <div class="form-group mb-3">
          <div class="input-group input-group-alternative">
            <div class="input-group-prepend">
              <span class="input-group-text"
                ><i class="ni ni-single-02"></i
              ></span>
            </div>
            <input
              v-model.trim="user.username"
              class="form-control"
              placeholder="e.g john"
              autofocus
              type="text"
              id="js-username-input"
              autocomplete="username"
              :disabled="loading"
              required
            />
          </div>
          <p id="login-message">{{message}}</p>
        </div>
        <div class="form-group focused">
          <div class="input-group input-group-alternative">
            <div class="input-group-prepend">
              <span class="input-group-text"
                ><i class="ni ni-lock-circle-open"></i
              ></span>
            </div>
            <input
              v-model.trim="user.password"
              class="form-control"
              placeholder="Password"
              type="password"
              id="js-password-input"
              autocomplete="current-password"
              :disabled="loading"
              required
            />
          </div>
        </div>
        <div
          class="custom-control custom-control-alternative custom-checkbox"
        >
          <input
            v-model="user.remember"
            class="custom-control-input"
            id="customCheckLogin"
            type="checkbox"
          />
          <label class="custom-control-label" for="customCheckLogin">
            <span>Remember me</span>
          </label>
        </div>
        <div class="text-center">
          <button
            id="js-submit"
            type="submit"
            class="btn btn-primary btn-block mt-4"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
  <div class="row mt-3">
    <div class="col-6">
      <a href="#" class="text-light">
        <small>Forgot password?</small>
      </a>
    </div>
    <div class="col-6 text-right">
      <router-link :to="{name: 'signup'}" class="text-light">
        <small>Create account</small>
      </router-link>
    </div>
  </div>
</div>`,
}
